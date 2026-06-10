import { toggleTab } from '../../state/actions/ui.js';
import Component from '../../utils/component.js';

class Tab extends Component('components/tab/index.html', 'components/tab/style.css') {
  static observedAttributes = ['disabled'];

  constructor() {
    super();

    this._name = null;
    mobx.makeObservable(this, {
      _name: mobx.observable
    });
  }

  // noinspection JSUnusedGlobalSymbols
  async attributeChangedCallback(name, _, curr) {
    await this._load; // NOTE: Required to ensure shadowRoot is available, maybe change later

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
  connect() {
    this._main = this.shadowRoot.querySelector('main');

    this.register(
      state => state.ui.tabs[this._name],
      tab => {
        this._main.style.width = tab ? '20dvw' : '0';
      }
    )

    const aside = this.shadowRoot.querySelector('aside');

    aside.addEventListener('click', () => toggleTab(this._name));
  }

  set name(name) {
    this._name = name;
  }
}

customElements.define('ens-tab', Tab);
