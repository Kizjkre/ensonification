export const createScoreGeometry = ({
  lineMode, staffCount, height, width, coords, blockOrder, xscale, yscale, xmin, ymin
}) => {
  const staffRects = new Float32Array(Math.max(0, staffCount - 1) * 4);
  const rectangles = new Float32Array(lineMode ? 0 : coords.length * 4);
  const lines = new Float32Array(lineMode ? coords.length * 4 : 0);

  for (let i = 1; i < staffCount; i++) {
    const offset = (i - 1) * 4;
    staffRects.set([0, height / staffCount * i - 2.5, width, 5], offset);
  }

  if (lineMode) {
    for (let i = 0; i < coords.length; i++) {
      const current = coords[i];
      const next = coords[i + 1] || current;
      const offset = i * 4;
      lines.set([
        xscale(current.x), yscale(current.y),
        xscale(next.x), yscale(next.y)
      ], offset);
    }
  } else {
    blockOrder.forEach((index, i) => {
      const { x, y } = coords[index];
      const offset = i * 4;
      const rectWidth = xscale.bandwidth();
      const rectHeight = yscale.bandwidth();
      rectangles.set([
        xscale(x) - +(rectWidth < xmin) * xmin / 2,
        yscale(y) - +(rectHeight < ymin) * ymin / 2,
        rectWidth < xmin ? xmin : rectWidth,
        rectHeight < ymin ? ymin : rectHeight
      ], offset);
    });
  }

  return { staffRects, rectangles, lines };
};

export const createScoreColors = (color, blockOrder) => {
  const lineColors = new Float32Array(color.length * 2);
  for (let i = 0; i < color.length; i++) {
    lineColors[i * 2] = color[i];
    lineColors[i * 2 + 1] = color[i + 1] ?? color[i];
  }

  return {
    lineColors,
    blockColors: Float32Array.from(blockOrder, index => color[index])
  };
};

export const createPlayheadGeometry = ({
  scrollEnabled, width, height, padding, position, bandwidth, dataScale, measure
}) => {
  const fixedPlayhead = width * 0.3;
  const measurePlayhead = scrollEnabled
    ? fixedPlayhead - padding / 2 - position * bandwidth * dataScale
    : measure * bandwidth;
  const positionPlayhead = scrollEnabled
    ? fixedPlayhead - padding / 2
    : (measure + position) * bandwidth;

  return new Float32Array([
    measurePlayhead, 0, padding, height,
    positionPlayhead, 0, padding, height
  ]);
};
