import 'https://unpkg.com/mobx/dist/mobx.umd.production.min.js';

mobx.configure({
  enforceActions: 'always',
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true,
  disableErrorBoundaries: true
});

const state = {
  scores: [],
  current: {
    score: null,
    field: null
  },
  ui: {
    shown: true,
    tabs: {
      data: false,
      field: false,
      type: false,
      transform: false,
      encoding: false,
      mark: false
    }
  },
  utils: {
    free: []
  }
};

mobx.makeAutoObservable(state);

export default state;

export const score = Object.freeze({
  id: state.scores.length,
  name: '',
  data: []
});

export const data = Object.freeze({
  name: '',
  data: [],
  columns: {},
  id: -1
});
