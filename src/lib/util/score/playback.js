const post = async (path, body, description) => {
  try {
    const response = await fetch(`http://localhost:4433/${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`POST /${path} failed with status ${response.status}.`);
    }
  } catch (error) {
    console.error(`Unable to send score ${description} to the local server:`, error);
  }
};

export const createPlayheadNotifier = isConnected => {
  let lastFileId = null;
  let lastProgress = null;
  let initialActionSent = false;
  let actionSent = false;
  let lastActionLivePointCount = null;

  const reset = () => {
    lastProgress = null;
    initialActionSent = false;
    actionSent = false;
    lastActionLivePointCount = null;
  };

  const notify = (fileId, currentProgress, points, cutoff, livePointCount) => {
    if (lastFileId !== fileId) {
      lastFileId = fileId;
      reset();
    }

    if (lastProgress === null) {
      const epsilon = Math.max(1, Math.abs(currentProgress)) * Number.EPSILON * 4;
      lastProgress = currentProgress - epsilon;
    }

    if (currentProgress < lastProgress) {
      lastProgress = currentProgress;
      return;
    }

    if (actionSent && livePointCount > lastActionLivePointCount) actionSent = false;

    const thresholdPoints = !initialActionSent
      ? points
      : points.slice(-(livePointCount - lastActionLivePointCount));
    const fraction = Number.isFinite(cutoff) ? Math.min(1, Math.max(0, cutoff)) : 0.9;
    const thresholdProgress = thresholdPoints.length
      ? thresholdPoints[0].progress +
        (thresholdPoints[thresholdPoints.length - 1].progress - thresholdPoints[0].progress) * fraction
      : null;

    let low = 0;
    let high = points.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (points[middle].progress <= lastProgress) low = middle + 1;
      else high = middle;
    }

    if (!initialActionSent) {
      const data = [];
      const dataProgress = thresholdProgress === null
        ? currentProgress
        : Math.min(currentProgress, thresholdProgress);
      for (let i = low; i < points.length && points[i].progress <= dataProgress; i++) {
        data.push(points[i].datum);
      }
      if (data.length && isConnected()) void post('datum', data, 'datum');
    }

    if (!actionSent && thresholdProgress !== null && currentProgress >= thresholdProgress) {
      actionSent = true;
      if (!initialActionSent) initialActionSent = true;
      lastActionLivePointCount = livePointCount;
      if (isConnected()) void post('action', { payload: 'state' }, 'action');
    }

    lastProgress = currentProgress;
  };

  return { notify, reset };
};
