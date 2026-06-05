const html = await fetch('components/tab/index.html').then(r => r.text());

class Tab extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = html;
  }

  // noinspection JSUnusedGlobalSymbols
  connectedCallback() {
    const aside = this.shadowRoot.querySelector('aside');
    const main = this.shadowRoot.querySelector('main');
    let shown = false;

    aside.addEventListener('click', () => {
      shown = !shown;
      // main.style.width = shown ? 'min(calc-size(max-content, size), 20dvw)' : '0'; NOTE: not supported in all browsers: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/calc-size#browser_compatibility
      main.style.width = shown ? '20dvw' : '0'; // NOTE: workaround
    });
  }
}

customElements.define('ens-tab', Tab);
