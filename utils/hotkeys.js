import { toggleUI } from '../state/actions/ui.js';

document.addEventListener('keyup', e => {
  switch (e.key) {
    case 'Escape':
      toggleUI();
      break;
  }
});
