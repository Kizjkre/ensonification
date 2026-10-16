const MONTHS = new Set([
  'jan', 'january',
  'feb', 'february',
  'mar', 'march',
  'apr', 'april',
  'may',
  'jun', 'june',
  'jul', 'july',
  'aug', 'august',
  'sep', 'sept', 'september',
  'oct', 'october',
  'nov', 'november',
  'dec', 'december'
]);

const WEEKDAYS = new Set([
  'mon', 'monday',
  'tue', 'tues', 'tuesday',
  'wed', 'wednesday',
  'thu', 'thur', 'thurs', 'thursday',
  'fri', 'friday',
  'sat', 'saturday',
  'sun', 'sunday'
]);

const LIKERT = new Set([
  'strongly disagree',
  'disagree',
  'neutral',
  'agree',
  'strongly agree'
]);

const normalize = v => String(v).trim().toLowerCase();

const isNumber = v => {
  if (v == null || v === '') return false;
  return Number.isFinite(Number(v));
};

const isTemporal = value => {
  if (value == null || value === '') return false;

  const str = String(value).trim();

  // Unix timestamps
  if (/^\d{10}$/.test(str) || /^\d{13}$/.test(str)) {
    const n = Number(str);
    const d = new Date(n < 1e12 ? n * 1000 : n);
    return !isNaN(d.getTime());
  }

  // Year only
  if (/^\d{4}$/.test(str)) {
    const year = Number(str);
    return year >= 1000 && year <= 3000;
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return true;
  }

  // YYYY-MM-DD HH:mm:ss
  if (
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/.test(
      str
    )
  ) {
    return true;
  }

  // HH:mm[:ss]
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
    const [h, m] = str.split(':').map(Number);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  }

  return !isNaN(Date.parse(str));
};

const detectTemporalSubtype = values => {
  const counts = {
    timestamp: 0,
    year: 0,
    date: 0,
    datetime: 0,
    time: 0
  };

  for (const value of values) {
    const str = String(value).trim();

    if (/^\d{10}$|^\d{13}$/.test(str)) {
      counts.timestamp++;
    } else if (/^\d{4}$/.test(str)) {
      counts.year++;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      counts.date++;
    } else if (/^\d{4}-\d{2}-\d{2}[ T]/.test(str)) {
      counts.datetime++;
    } else if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
      counts.time++;
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0][0];
};

const isGeoJSON = value => {
  try {
    const obj =
      typeof value === 'string'
        ? JSON.parse(value)
        : value;

    if (!obj || typeof obj !== 'object') {
      return false;
    }

    const geoTypes = new Set([
      'Point',
      'MultiPoint',
      'LineString',
      'MultiLineString',
      'Polygon',
      'MultiPolygon',
      'GeometryCollection',
      'Feature',
      'FeatureCollection'
    ]);

    return geoTypes.has(obj.type);
  } catch {
    return false;
  }
};

export default rows => {
  if (!rows?.length) return {};

  const result = {};
  const columns = Object.keys(rows[0]);

  for (const column of columns) {
    const values = rows
      .map(r => r[column])
      .filter(v => v != null && String(v).trim() !== '');

    if (!values.length) {
      result[column] = {
        type: 'nominal',
        confidence: 1,
        scores: {
          quantitative: 0,
          temporal: 0,
          ordinal: 0,
          nominal: 1,
          geojson: 0
        }
      };
      continue;
    }

    const normalized = values.map(normalize);

    const uniqueCount = new Set(normalized).size;
    const uniqueRatio = uniqueCount / values.length;

    const numericRatio =
      values.filter(isNumber).length / values.length;

    const temporalRatio =
      values.filter(isTemporal).length / values.length;

    const geoRatio =
      values.filter(isGeoJSON).length / values.length;

    const monthRatio =
      normalized.filter(v => MONTHS.has(v)).length /
      values.length;

    const weekdayRatio =
      normalized.filter(v => WEEKDAYS.has(v)).length /
      values.length;

    const likertRatio =
      normalized.filter(v => LIKERT.has(v)).length /
      values.length;

    let quantitative = 0;
    let temporal = 0;
    let ordinal = 0;
    let nominal = 0;
    let geojson = 0;

    // GEOJSON
    geojson = geoRatio;

    // TEMPORAL
    temporal = Math.max(
      temporalRatio,
      monthRatio,
      weekdayRatio
    );

    // QUANTITATIVE
    quantitative = numericRatio;

    // ORDINAL HEURISTICS
    const lowCardinality =
      uniqueCount <= 20 || uniqueRatio < 0.5;

    const integerCategories =
      numericRatio > 0.9 &&
      uniqueCount <= 20;

    ordinal =
      (likertRatio * 0.8) +
      (monthRatio * 0.8) +
      (weekdayRatio * 0.8) +
      (lowCardinality ? 0.25 : 0) +
      (integerCategories ? 0.4 : 0);

    ordinal = Math.min(1, ordinal);

    // NOMINAL
    nominal =
      (1 - Math.max(
        quantitative,
        temporal,
        ordinal,
        geojson
      )) +
      (uniqueRatio > 0.7 ? 0.25 : 0);

    nominal = Math.max(0, nominal);

    const scores = {
      quantitative,
      temporal,
      ordinal,
      nominal,
      geojson
    };

    // normalize to probabilities
    const total =
      quantitative +
      temporal +
      ordinal +
      nominal +
      geojson;

    Object.keys(scores).forEach(key => {
      scores[key] = total
        ? scores[key] / total
        : 0;
    });

    const [type, confidence] = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];

    result[column] = {
      type,
      confidence: Number(confidence.toFixed(3)),
      scores
    };

    if (type === 'temporal') {
      result[column].subtype =
        detectTemporalSubtype(values);
    }
  }

  return result;
};
