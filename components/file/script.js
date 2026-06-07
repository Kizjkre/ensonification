import { setCurrent } from '../../state/actions/current.js';
import { setName } from '../../state/actions/score.js';
import state from '../../state/state.js';

const html = await fetch('components/file/index.html').then(r => r.text());
const css = await fetch('components/file/style.css').then(r => r.text());
const global = await fetch('style.css').then(r => r.text());

class File extends HTMLElement {
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
    const button = this.shadowRoot.querySelector('button');
    const input = this.shadowRoot.querySelector('input');

    input.focus();

    button.addEventListener('click', () => setCurrent('score', this._id));

    input.addEventListener('input', () => {
      input.value = input.value.trimStart();
      setName(this._id, input.value);
    });
    input.addEventListener('change', () => input.blur());

    mobx.autorun(() => {
      button.classList.toggle('selected', state.current.score === this._id);
    });
  }

  get ensId() {
    return this._id;
  }

  set ensId(id) {
    this._id = id;
  }
}

customElements.define('ens-file', File);
