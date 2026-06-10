import { setCurrent } from '../../state/actions/current.js';
import { setName } from '../../state/actions/score.js';
import Component from '../../utils/component.js';

class File extends Component('components/file/index.html', 'components/file/style.css') {
  constructor() {
    super();
  }

  // noinspection JSUnusedGlobalSymbols
  connect() {
    const button = this.shadowRoot.querySelector('button');
    const input = this.shadowRoot.querySelector('input');

    this.register(
      state => state.current.score,
      score => button.classList.toggle('selected', score === this._id)
    );

    input.focus();

    button.addEventListener('click', () => setCurrent('score', this._id));

    input.addEventListener('input', () => {
      input.value = input.value.trimStart();
      setName(this._id, input.value);
    });
    input.addEventListener('change', () => input.blur());
  }

  get ensId() {
    return this._id;
  }

  set ensId(id) {
    this._id = id;
  }
}

customElements.define('ens-file', File);
