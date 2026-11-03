import atoi from '$lib/util/atoi.js';

export const buildXValues = (baseXValues, appendedPoints) => {
  if (!appendedPoints.length) return baseXValues;

  const lastX = baseXValues.reduce((maximum, value) =>
    value != null && value !== '' && Number.isFinite(Number(value))
      ? Math.max(maximum, Number(value))
      : maximum, -1);
  return [...baseXValues, ...appendedPoints.map(point => {
    const offset = point.x == null || point.x === '' ? NaN : Number(point.x);
    return Number.isFinite(offset) ? lastX + offset : NaN;
  })];
};

export const prepareScoreValues = ({ raw, appendedPoints, xColumn, yColumn, colorColumn }) => {
  const yValues = [
    ...(raw?.data.map(row => row[raw.columns[yColumn]]) || []),
    ...appendedPoints.map(point => point.y)
  ];
  const colorValues = [
    ...(raw?.data.map(row => row[raw.columns[colorColumn]]) || []),
    ...appendedPoints.map(point => point.color)
  ];
  const yTransform = atoi(yValues);
  const colorTransform = atoi(colorValues);
  const baseXValues = xColumn !== -1
    ? atoi(raw?.data.map(row => row[raw.columns[xColumn]]) || []).out
    : raw.data.map((_, i) => i);

  return {
    x: buildXValues(baseXValues, appendedPoints),
    y: yTransform.out,
    color: colorTransform.out,
    yMap: yTransform.map,
    colorMap: colorTransform.map
  };
};

export const filterScoreData = (xValues, yValues, colorValues, baseDataLength) => {
  const length = Math.min(xValues?.length, yValues?.length, colorValues?.length);
  const validIndices = Array.from({ length }, (_, i) => i)
    .filter(i =>
      !isNaN(xValues[i]) && !isNaN(yValues[i]) && !isNaN(colorValues[i]) &&
      xValues[i] !== null && yValues[i] !== null && colorValues[i] !== null
    );
  const x = validIndices.map(i => xValues[i]);
  const y = validIndices.map(i => yValues[i]);
  const color = validIndices.map(i => colorValues[i]);

  return {
    validIndices,
    baseXCount: new Set(validIndices.filter(i => i < baseDataLength).map(i => xValues[i])).size,
    x,
    y,
    color,
    coords: x.map((value, i) => ({ x: value, y: y[i] }))
  };
};

export const getDatum = ({ index, raw, appendedPoints, xColumn, yColumn, colorColumn, xValues }) => {
  const row = raw.data[index];
  const appended = index >= raw.data.length ? appendedPoints[index - raw.data.length] : null;

  return {
    x: xColumn === -1 ? index : row ? row[raw.columns[xColumn]] : xValues[index],
    y: row ? row[raw.columns[yColumn]] : appended?.y,
    color: row ? row[raw.columns[colorColumn]] : appended?.color
  };
};

export const buildPlayheadPoints = ({
  coords, validIndices, raw, appendedPoints, xColumn, yColumn, colorColumn, xValues, xscale, bandwidth
}) => {
  if (!bandwidth) return [];

  return coords.map((point, i) => {
    const index = validIndices[i];
    return {
      progress: xscale(point.x) / bandwidth,
      datum: getDatum({ index, raw, appendedPoints, xColumn, yColumn, colorColumn, xValues })
    };
  }).filter(point => Number.isFinite(point.progress))
    .sort((a, b) => a.progress - b.progress);
};
