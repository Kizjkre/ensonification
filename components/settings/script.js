import '../browser/script.js';
import '../data/script.js';
import '../fab/script.js';
import '../parameter/script.js';
import { encodings } from '../../engine/encoding.js';
import { marks } from '../../engine/mark.js';
import { transforms } from '../../engine/transform.js';
import { types } from '../../engine/type.js';
import { createScore } from '../../state/actions/score.js';
import { toggleUI } from '../../state/actions/ui.js';
import { register, unregister } from '../../state/reactions/settings.js';
import state from '../../state/state.js';
import Component from '../../utils/component.js';

class Settings extends Component('components/settings/index.html', 'components/settings/style.css') {
  constructor() {
    super();
  }

  // noinspection JSUnusedGlobalSymbols
  connect() {
    const escape = this.shadowRoot.querySelector('#escape');
    const score = this.shadowRoot.querySelector('#score');
    const section = this.shadowRoot.querySelector('section');

    const field = this.shadowRoot.querySelector('#field');
    const type = this.shadowRoot.querySelector('#type');
    const transform = this.shadowRoot.querySelector('#transform');
    const encoding = this.shadowRoot.querySelector('#encoding');
    const mark = this.shadowRoot.querySelector('#mark');

    this.register(
      state => state.ui.shown,
      shown => section.style.animation = shown ? 'appear 300ms ease-out forwards' : 'disappear 300ms ease-in forwards'
    );

    let fdisposer;
    this.register(
      state => state.current.score,
      score => {
        if (fdisposer) fdisposer();
        // console.log('score', score);
        if (score === null) {
          field.parameters = [];
          fdisposer = null;
        } else {
          fdisposer = field.register(
            state => state.scores[score],
            score => {
              let ddisposer;
              if (ddisposer) ddisposer();
              if (score === null) {

              }
            }
          );
        }
      }
    );

    mobx.runInAction(() => {
      field.name = 'field';

      field.onClick = (_, i) => {

      };

      type.name = 'type';
      // type.parameters = () => types;
      // type.onClick = (_, i) => {
      //
      // };

      transform.name = 'transform';
      // transform.parameters = () => transforms;

      encoding.name = 'encoding';
      // encoding.parameters = () => encodings;

      mark.name = 'mark';
      // mark.parameters = () => marks;
    });

    escape.addEventListener('click', () => toggleUI(false));

    score.addEventListener('click', () => createScore());
  }
}

customElements.define('ens-settings', Settings);
