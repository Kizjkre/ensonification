import state from '../state.js';

let disposer;

export const register = ({ add, remove }) => disposer = mobx.observe(state.scores, changes => {
  changes.type === 'splice' && add(changes.added);
  if (changes.type === 'update') {
    changes.newValue && add([changes.newValue]);
    changes.oldValue && remove(changes.oldValue);
  }
});

export const unregister = () => disposer();
