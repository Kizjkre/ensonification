import * as d3 from 'd3';

export const colorComponents = value => {
  const parsed = d3.color(value);
  return parsed
    ? [parsed.r / 255, parsed.g / 255, parsed.b / 255, parsed.opacity]
    : [0, 0, 0, 0];
};

export const createPalette = () => {
  const palette = new Uint8Array(256 * 4);
  for (let i = 0; i < 256; i++) {
    const color = d3.color(d3.interpolateTurbo(i / 255));
    palette.set([color.r, color.g, color.b, 255], i * 4);
  }
  return palette;
};
