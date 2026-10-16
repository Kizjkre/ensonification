import { getContext, setContext } from 'svelte';

const STATE = Symbol('state');

export const state = $state({
  scores: [],
  data: [],
  engine: 'v0',
  current: {
    score: null
  },
  ui: {
    shown: true,
    views: []
  },
  utils: {
    free: {
      scores: [],
      data: []
    }
  }
});

export const view = Object.freeze({
  id: -1,
  name: '',
  data: []
});

export const score = Object.freeze({
  id: -1,
  name: '',
  data: [],
  views: [{
    ...structuredClone(view),
    id: 0
  }],
  utils: {
    free: {
      views: []
    }
  }
});

export const data = Object.freeze({
  name: '',
  data: [],
  columns: {},
  id: -1
});

export const set = () => setContext(STATE, state);

export const get = () => getContext(STATE);
