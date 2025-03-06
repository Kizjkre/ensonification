import { autoType, csvParse, csvParseRows } from 'd3-dsv';

self.onmessage = event => {
  const { action, payload } = event.data;
  let parsed;

  switch (action) {
    case 'data':
      parsed = csvParse(payload, autoType);
      break;
    case 'matrix':
      parsed = csvParseRows(payload, autoType);
      break;
    default:
      parsed = payload;
  }

  self.postMessage({ action, payload: parsed });
};
