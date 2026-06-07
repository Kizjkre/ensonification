import '../file/script.js';
import { resetCurrent } from '../../state/actions/current.js';
import state from '../../state/state.js';

const html = await fetch('components/browser/index.html').then(r => r.text());
const css = await fetch('components/browser/style.css').then(r => r.text());
const global = await fetch('style.css').then(r => r.text());

class Browser extends HTMLElement {
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
    const div = this.shadowRoot.querySelector('div');
    div.addEventListener('click', e => e.target === div && resetCurrent());

    mobx.observe(state.scores, changes => {
      changes.added.forEach(score => {
        const file = document.createElement('ens-file');
        file.ensId = score.id;
        div.appendChild(file);
      });

      changes.removed.forEach(score => {
        const file = div.querySelector(`[ens-id='${ score.id }']`); // NOTE: probably doesn't work
        div.removeChild(file);
      });
    });
  }
}

customElements.define('ens-browser', Browser);
