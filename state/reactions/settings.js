import state from '../state.js';

const disposer = new Set();

const toggle = element => mobx.reaction(
  () => state.ui.shown ? 'appear 300ms ease-out forwards' : 'disappear 300ms ease-in forwards',
  style => element.style.animation = style
);

const field = f => {
  let d;
  return mobx.reaction(
    () => state.current.score,
    score => {
      if (d) d();
      if (!(score in state.scores)) {
        f.textContent = '';
        return;
      }
      const { data } = state.scores[score];
      d = mobx.observe(data, changes => {
        console.log(changes);
      });
    }
  );
};

export const register = (element, f) => {
  disposer.add(toggle(element));
  disposer.add(field(f));
  return disposer;
};

export const unregister = () => {
  disposer.forEach(d => d());
  disposer.clear();
};
