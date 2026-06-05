import '../browser/script.js';
import '../fab/script.js';
import '../field/script.js';
import '../parameter/script.js';
import { encodings } from '../../engine/encoding.js';
import { marks } from '../../engine/mark.js';
import { transforms } from '../../engine/transform.js';
import { types } from '../../engine/type.js';
import state, {
  type as createType,
  transform as createTransform,
  encoding as createEncoding,
  mark as createMark
} from '../../utils/state.js';

const html = await fetch('components/settings/index.html').then(r => r.text());

class Settings extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = html;
  }

  // noinspection JSUnusedGlobalSymbols
  connectedCallback() {
    const escape = this.shadowRoot.querySelector('#escape');
    const mount = this.shadowRoot.querySelector('#mount');
    const section = this.shadowRoot.querySelector('section');

    const type = this.shadowRoot.querySelector('#type');
    const transform = this.shadowRoot.querySelector('#transform');
    const encoding = this.shadowRoot.querySelector('#encoding');
    const mark = this.shadowRoot.querySelector('#mark');

    let shown = true;

    escape.addEventListener('click', () => {
      section.style.animation = 'disappear 150ms ease-in forwards';
      shown = false;
    });

    mount.addEventListener('click', () => document.dispatchEvent(new CustomEvent('ens-mount')));

    document.addEventListener('hotkey-escape', () => {
      if (shown) {
        section.style.animation = 'disappear 150ms ease-in forwards';
        shown = false;
      } else {
        section.style.animation = 'appear 150ms ease-out forwards';
        shown = true;
      }
    });

    type.onConnected({
      param: () => {
        const fields = state.files[state.id]?.fields;
        const { field } = state;
        return types.indexOf(fields?.[field]);
      },
      params: types,
      listener: i => createType(i)
    });
    transform.onConnected({
      param: () => {
        const { field } = state;
        return state.transforms[state.id]?.[field];
      },
      params: transforms,
      listener: i => createTransform(i)
    });
    encoding.onConnected({
      param: () => {
        const { field } = state;
        return state.encodings[state.id]?.[field];
      },
      params: encodings,
      listener: i => createEncoding(i)
    });
    mark.onConnected({
      param: () => {
        const { field } = state;
        return state.marks[state.id]?.[field];
      },
      params: marks,
      listener: i => createMark(i)
    });
  }
}

customElements.define('ens-settings', Settings);
