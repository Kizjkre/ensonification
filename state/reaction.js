import state from './state.js';

const createAccessors = (root, path = []) => {
  const children = new Map();

  return new Proxy(() => {}, {
    get(_, key) {
      if (typeof key === 'symbol') {
        return Reflect.get(_, key);
      }

      if (!children.has(key)) {
        children.set(
          key,
          createAccessors(root, [...path, key])
        );
      }

      return children.get(key);
    },

    apply() {
      const observable = path.reduce((obj, key) => obj[key], root);
      return observable instanceof Array ? [...observable]  : observable;
    }
  });
};

export const accessors = createAccessors(state);

const reactions = new Map();

export default (observed, effect, options) => {
  if (reactions.has(observed)) {
    reactions.get(observed).effects.add(effect);
    effect(observed());
  } else {
    const effects = new Set([effect]);
    reactions.set(observed, {
      effects,
      disposer: mobx.reaction(
        observed,
        (...values) => effects.forEach(effect => effect(...values)),
        { fireImmediately: true, ...options }
      )
    });
  }

  return () => {
    const entry = reactions.get(observed);
    if (!entry) return;

    entry.effects.delete(effect);

    if (entry.effects.size === 0) {
      entry.disposer();
      reactions.delete(observed);
    }
  };
};
