import state from '../utils/state.js';

const score = {
  data: {
    values: []
  },
  mark: '',
  encoding: {}
};

mobx.makeAutoObservable(score);

mobx.autorun(() => {
  score.data.values.length = 0;
  score.data.values.push(state.files[state.id].payload);
});

export default score;
