import state from '../state/state.js';

export default (html, css, global = 'style.css', Base = HTMLElement) => class extends Base {
  constructor() {
    super();
    this._disposers = new Set();

    this.attachShadow({ mode: 'open' });

    this._load = (async () => {
      const _html = await fetch(html).then(r => r.text());
      const _css = await fetch(css).then(r => r.text());
      const _global = await fetch(global).then(r => r.text());

      this.shadowRoot.innerHTML = _html;

      const style = document.createElement('style');
      style.textContent = _css + '\n' + _global;
      this.shadowRoot.append(style);
    })();
  }

  // noinspection JSUnusedGlobalSymbols
  async connectedCallback() {
    await this._load;
    // noinspection JSUnresolvedReference
    this.connect?.();
  }

  // noinspection JSUnusedGlobalSymbols
  disconnectedCallback() {
    this._disposers.forEach(d => d());
    this._disposers.clear();

    // noinspection JSUnresolvedReference
    this.disconnect?.();
  }

  register(dep, effect, options) {
    const d = mobx.reaction(() => dep(state), effect, { firesImmediately: true, ...options });
    this._disposers.add(d);
    return d;
  }

  unregister(disposer) {
    disposer();
    this._disposers.delete(disposer);
  }
}
