import { deleteScore } from '../state/actions/score.js';
import { toggleUI } from '../state/actions/ui.js';
import state from '../state/state.js';

document.addEventListener('keyup', e => {
  switch (e.key) {
    case 'Escape':
      toggleUI();
      break;
    case 'Backspace':
      deleteScore(state.current.score);
      break;
  }
});
