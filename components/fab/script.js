const html = await fetch('components/fab/index.html').then(r => r.text());

class FAB extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = html;

    const button = this.shadowRoot.querySelector('button');
    const popup = this.shadowRoot.querySelector('div');

    button.addEventListener('mouseenter', () => {
      popup.style.display = 'block';
      popup.style.opacity = '1';
    });
    button.addEventListener('mouseleave', () => {
      popup.style.opacity = '0';
      setTimeout(() => popup.style.display = 'none', 100);
    });
  }
}

customElements.define('ens-fab', FAB);
