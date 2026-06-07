import '../tab/script.js';
import state from '../../state/state.js';

const html = await fetch('components/parameter/index.html').then(r => r.text());
const css = await fetch('components/parameter/style.css').then(r => r.text());
const global = await fetch('style.css').then(r => r.text());

class Parameter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = html;

    const style = document.createElement('style');
    style.textContent = css + '\n' + global;
    this.shadowRoot.append(style);

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

    this._name = null;
    this._listener = null;
    mobx.makeObservable(this, {
      _name: mobx.observable
    });

    this._div = this.shadowRoot.querySelector('div');
    this._tab = this.shadowRoot.querySelector('ens-tab');
  }

  // noinspection JSUnusedGlobalSymbols
  connectedCallback() {
    mobx.autorun(() => {
      this._tab.setAttribute('disabled', (state.current.score === null).toString());
    });

    mobx.autorun(() => {
      // Array.from(this._div.children).forEach(b => b.classList.toggle('checked', +b.value === p));
      // this._tab.style.setProperty('--indicator', p > -1 ? 'var(--text)' : 'transparent');
    });
  }

  add(parameters) {
    parameters.forEach((p, i) => {
      const button = document.createElement('button');
      button.textContent = p.toLowerCase();
      button.value = i;
      button.id = `transform-${ i }`;
      button.addEventListener('click', () => this._listener(p, i));

      this._div.appendChild(button);
    });
  }

  addHeading(title) {
    const h3 = document.createElement('h3');
    h3.textContent = title;
    this._div.appendChild(h3);
  }

  set name(name) {
    this._name = name;
    this._tab.name = name;
  }

  set onClick(listener) {
    this._listener = listener;
  }
}

customElements.define('ens-parameter', Parameter);
