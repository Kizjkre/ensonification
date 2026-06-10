import Component from '../../utils/component.js';

class FAB extends Component('components/fab/index.html', 'components/fab/style.css') {
  constructor() {
    super();
  }

  // noinspection JSUnusedGlobalSymbols
  connect() {
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
