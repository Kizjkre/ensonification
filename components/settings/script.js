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

const html = await fetch('components/settings/index.html').then(r => r.text());
const css = await fetch('components/settings/style.css').then(r => r.text());
const global = await fetch('style.css').then(r => r.text());

class Settings extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = html;

    const style = document.createElement('style');
    style.textContent = css + '\n' + global;
    this.shadowRoot.append(style);
  }

  // noinspection JSUnusedGlobalSymbols
  connectedCallback() {
    const escape = this.shadowRoot.querySelector('#escape');
    const score = this.shadowRoot.querySelector('#score');
    const section = this.shadowRoot.querySelector('section');

    const field = this.shadowRoot.querySelector('#field');
    const type = this.shadowRoot.querySelector('#type');
    const transform = this.shadowRoot.querySelector('#transform');
    const encoding = this.shadowRoot.querySelector('#encoding');
    const mark = this.shadowRoot.querySelector('#mark');

    register(section, field);

    // NOTE: only updates on score change
    mobx.reaction(
      () => state.current.score,
      () => field.textContent = ''
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

  // noinspection JSUnusedGlobalSymbols
  disconnectedCallback() {
    unregister();
  }
}

customElements.define('ens-settings', Settings);
