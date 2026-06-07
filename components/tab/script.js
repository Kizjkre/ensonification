import { toggleTab } from '../../state/actions/ui.js';
import state from '../../state/state.js';

const html = await fetch('components/tab/index.html').then(r => r.text());
const css = await fetch('components/tab/style.css').then(r => r.text());
const global = await fetch('style.css').then(r => r.text());

class Tab extends HTMLElement {
  static observedAttributes = ['disabled'];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = html;

    const style = document.createElement('style');
    style.textContent = css + '\n' + global;
    this.shadowRoot.append(style);

    this._name = null;
    mobx.makeObservable(this, {
      _name: mobx.observable
    });

    this._main = this.shadowRoot.querySelector('main');
  }

  // noinspection JSUnusedGlobalSymbols
  attributeChangedCallback(name, _, curr) {
    switch (name) {
      case 'disabled':
        const section = this.shadowRoot.querySelector('section');
        section.style.cursor = curr === 'true' ? 'not-allowed' : 'auto';
        this._main.style.filter = curr === 'true' ? 'brightness(0.5)' : 'none';
        curr === 'true' ?
          this._main.setAttribute('inert', '') :
          this._main.removeAttribute('inert');
        break;
    }
  }

  // noinspection JSUnusedGlobalSymbols
  connectedCallback() {
    const aside = this.shadowRoot.querySelector('aside');

    aside.addEventListener('click', () => toggleTab(this._name));

    mobx.autorun(() => {
      // this._main.style.width = state.ui.tabs[this._name] ? 'min(calc-size(max-content, size), 20dvw)' : '0'; NOTE: not supported in all browsers: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/calc-size#browser_compatibility
      this._main.style.width = state.ui.tabs[this._name] ? '20dvw' : '0'; // NOTE: workaround
    });
  }

  set name(name) {
    this._name = name;
  }
}

customElements.define('ens-tab', Tab);
