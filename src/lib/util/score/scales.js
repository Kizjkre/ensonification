import * as d3 from 'd3';

export const createXLayout = ({ x, coords, width, baseXCount, scrollEnabled }) => {
  const xdomain = [...new Set(x)].sort((a, b) => a - b);
  const xpad = 0.1 / 50 * ((scrollEnabled ? baseXCount : xdomain.length) + 2);
  const xscale = d3.scaleBand()
    .domain([xdomain[0] - 2, xdomain[0] - 1, ...xdomain])
    .range([0, scrollEnabled
      ? width * (xdomain.length + 2) / (baseXCount + 2)
      : width])
    .padding(xpad);
  const blockOrder = coords.map((_, i) => i)
    .sort((a, b) => xscale(coords[a].x) - xscale(coords[b].x));
  const bandwidth = xscale.bandwidth() === 0
    ? width / (xdomain.length + 2)
    : xscale.bandwidth() / (1 - xpad);
  const padding = Math.max(1, xpad * bandwidth);

  return { xdomain, xpad, xscale, blockOrder, bandwidth, padding };
};

export const createYScale = ({ mode, y, height, blockMode, lineMode }) => {
  const padding = 0.01;
  switch (mode) {
    case blockMode:
      return d3.scaleBand()
        .domain([...new Set(y)].sort((a, b) => a - b))
        .range([height, 0])
        .padding(padding);
    case lineMode:
      return d3.scaleLinear()
        .domain(d3.extent(y))
        .range([height - 10 - padding * 2, padding * 2]);
  }
};

export const getScrollCoordinate = (progress, xscale, xdomain, bandwidth) => {
  const firstMapped = xscale(xdomain[0]);
  return Number.isFinite(firstMapped)
    ? firstMapped + (progress - 2) * bandwidth
    : (progress - 2) * bandwidth;
};
