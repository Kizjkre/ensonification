import state from '../../utils/state.js';

const html = await fetch('components/file/index.html').then(r => r.text());

class File extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = html;
  }

  // noinspection JSUnusedGlobalSymbols
  connectedCallback() {
    const type = this.getAttribute('type');
    const template = this.shadowRoot.querySelector(`#${ type }`);
    const clone = template.content.cloneNode(true);
    const button = this.shadowRoot.querySelector('button');
    button.prepend(clone);

    const id = this.getAttribute('ens-id');
    button.addEventListener('click', () => {
      state.id = state.id === +id ? -1 : +id;
      state.field = null;
    });

    mobx.autorun(() => {
      button.classList[state.id === +id ? 'add' : 'remove']('selected');
    });
  }
}

customElements.define('ens-file', File);
