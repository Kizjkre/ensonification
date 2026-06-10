import '../tab/script.js';
import Component from '../../utils/component.js';

class Parameter extends Component('components/parameter/index.html', 'components/parameter/style.css') {
  constructor() {
    super();

    this._name = null;
    this._listener = null;
    mobx.makeObservable(this, {
      _name: mobx.observable
    });
  }

  // noinspection JSUnusedGlobalSymbols
  connect() {
    this._div = this.shadowRoot.querySelector('div');
    this._tab = this.shadowRoot.querySelector('ens-tab');

    const slot = this.shadowRoot.querySelector('slot[name=name]');
    const dups = [...this.shadowRoot.querySelectorAll(`slot[name*=name-]`)];
    const copy = () =>
      slot.assignedNodes().forEach(node => {
        dups.forEach(duplicate => {
          const n = node.cloneNode(true);
          n.slot = duplicate.name;
          this.append(n);
        });
      });
    copy();
    slot.addEventListener('slotchange', copy);

    this.register(
      state => state.current.score,
      score => {
        const disabled = (score === null) + '';
        this._tab.setAttribute('disabled', disabled);
      }
    );

    mobx.reaction(
      () => this._name,
      name => {
        // this.register(
        //   state => state.
        // );
      }
    );

    // mobx.autorun(() => {
      // Array.from(this._div.children).forEach(b => b.classList.toggle('checked', +b.value === p));
      // this._tab.style.setProperty('--indicator', p > -1 ? 'var(--text)' : 'transparent');
    // });
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
    this._load.then(() => {
      this._tab.name = name;
    });
  }

  set onClick(listener) {
    this._listener = listener;
  }

  set parameters(parameters) {
    // console.log(parameters);
  }
}

customElements.define('ens-parameter', Parameter);
