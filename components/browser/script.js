import '../file/script.js';
import { resetCurrent } from '../../state/actions/current.js';
import Component from '../../utils/component.js';

class Browser extends Component('components/browser/index.html', 'components/browser/style.css') {
  constructor() {
    super();
  }

  // noinspection JSUnusedGlobalSymbols
  connect() {
    const div = this.shadowRoot.querySelector('div');
    div.addEventListener('click', e => e.target === div && resetCurrent());

    this.register(
      state => state.scores,
      (scores, prev) => {
        const added = scores?.filter(s => s !== null && !prev.includes(s));
        const removed = prev?.filter(s => s !== null && !scores.includes(s));

        added?.forEach(score => {
          const file = document.createElement('ens-file');
          file.ensId = score.id;
          file.id = `file-${ score.id }`;
          div.appendChild(file);
        });

        removed?.forEach(score => {
          const file = div.querySelector(`#file-${ score.id }`);
          div.removeChild(file);
        });
      }
    );
  }
}

customElements.define('ens-browser', Browser);
