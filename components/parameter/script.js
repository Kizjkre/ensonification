import '../tab/script.js';
import state from '../../utils/state.js';

const html = await fetch('components/parameter/index.html').then(r => r.text());

class Parameter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = html;

    this._callback = new Promise(res => this._resolve = res);

    const slot = this.shadowRoot.querySelector('slot[name=name]');
    const dups = [...this.shadowRoot.querySelectorAll(`slot[name*=name-]`)];
    slot.addEventListener('slotchange', () => {
      slot.assignedNodes().forEach(node => {
        dups.forEach(duplicate => {
          const n = node.cloneNode(true);
          n.slot = duplicate.name;
          this.append(n);
        });
      });
    });
  }

  // noinspection JSUnusedGlobalSymbols
  connectedCallback() {
    const div = this.shadowRoot.querySelector('div');
    // noinspection CssInvalidHtmlTagReference
    const tab = this.shadowRoot.querySelector('ens-tab');

    this._callback.then(({ param, params, listener }) => {
      params.forEach((p, i) => {
        const button = document.createElement('button');
        button.textContent = p.toLowerCase();
        button.value = i;
        button.id = `transform-${ i }`;
        button.addEventListener('click', () => listener(i));

        div.appendChild(button);
      });

      mobx.autorun(() => {
        const p = param();
        Array.from(div.children).forEach(b => b.classList.toggle('checked', +b.value === p));
        tab.style.setProperty('--indicator', p > -1 ? 'var(--text)' : 'transparent');
      });
    });
  }

  get onConnected() {
    return this._resolve;
  }
}

customElements.define('ens-parameter', Parameter);
