import { getDatum } from '$lib/util/score/data.js';

const findHoveredDatumIndex = ({
  mode, blockMode, lineMode, pointerX, pointerY, coords, blockOrder, xscale, yscale,
  dataScale, scrollOffset, padding, scrollEnabled, xmin, ymin
}) => {
  if (mode === blockMode) {
    const rectWidth = xscale.bandwidth();
    const gap = scrollEnabled ? padding : 0;

    for (let i = blockOrder.length - 1; i >= 0; i--) {
      const index = blockOrder[i];
      const point = coords[index];
      const rectHeight = yscale.bandwidth();
      const left = (xscale(point.x) - +(rectWidth < xmin) * xmin / 2) * dataScale + scrollOffset;
      const top = yscale(point.y) - +(rectHeight < ymin) * ymin / 2;
      const blockWidth = (rectWidth + gap) * dataScale - gap;
      const blockHeight = rectHeight < ymin ? ymin : rectHeight;

      if (
        pointerX >= left && pointerX <= left + blockWidth &&
        pointerY >= top && pointerY <= top + blockHeight
      ) {
        return index;
      }
    }
  } else if (mode === lineMode) {
    let datumIndex = -1;
    let nearestDistance = 36;

    for (let i = 0; i < coords.length; i++) {
      const point = coords[i];
      const dx = pointerX - (xscale(point.x) * dataScale + scrollOffset);
      const dy = pointerY - yscale(point.y);
      const distance = dx * dx + dy * dy;

      if (distance <= nearestDistance) {
        nearestDistance = distance;
        datumIndex = i;
      }
    }

    return datumIndex;
  }

  return -1;
};

export const getHoveredDatum = ({
  event, canvas, enabled, width, height, mode, blockMode, lineMode, coords, blockOrder,
  xscale, yscale, dataScale, scrollOffset, padding, scrollEnabled, xmin, ymin,
  validIndices, raw, appendedPoints, xColumn, yColumn, colorColumn, xValues
}) => {
  if (!enabled || !width || !height) return null;

  const rect = canvas.getBoundingClientRect();
  const pointerX = event.clientX - rect.left;
  const pointerY = event.clientY - rect.top;
  const datumIndex = findHoveredDatumIndex({
    mode, blockMode, lineMode, pointerX, pointerY, coords, blockOrder,
    xscale, yscale, dataScale, scrollOffset, padding, scrollEnabled, xmin, ymin
  });
  if (datumIndex === -1) return null;

  const datum = getDatum({
    index: validIndices[datumIndex],
    raw,
    appendedPoints,
    xColumn,
    yColumn,
    colorColumn,
    xValues
  });

  return {
    value: `(${ datum.x }, ${ datum.y }, ${ datum.color })`,
    left: Math.max(0, Math.min(pointerX + 12, width - 160)),
    top: Math.max(0, Math.min(pointerY + 12, height - 36))
  };
};
