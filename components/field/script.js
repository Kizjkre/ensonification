import '../tab/script.js';
import state from '../../utils/state.js';

const html = await fetch('components/field/index.html').then(r => r.text());

class Field extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = html;
  }

  // noinspection JSUnusedGlobalSymbols
  connectedCallback() {
    const div = this.shadowRoot.querySelector('div');
    // noinspection CssInvalidHtmlTagReference
    const tab = this.shadowRoot.querySelector('ens-tab');

    tab.shadowRoot.querySelector('aside').click();

    mobx.autorun(() => {
      const { field } = state;
      Array.from(div.children).forEach(b => b.classList.toggle('checked', b.value === field));
      tab.style.setProperty('--indicator', field ? 'var(--text)' : 'transparent');
    });

    mobx.autorun(() => {
      div.textContent = '';

      if (state.id === -1 || !state.files[state.id]) return;

      const data = state.files[state.id];

      if ('type' in data && data.type !== 'csv') return;

      const columns = Object.keys(data.fields);
      columns.forEach((c, i) => {
        const button = document.createElement('button');
        button.textContent = c;
        button.value = c;
        button.id = `field-${ i }`;
        button.addEventListener('click', () => state.field = state.field === c ? null : c);

        div.appendChild(button);
      });
    });
  }
}

customElements.define('ens-field', Field);
