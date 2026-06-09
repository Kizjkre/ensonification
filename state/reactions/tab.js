import state from '../state.js';

let disposer;

// this._main.style.width = state.ui.tabs[this._name] ? 'min(calc-size(max-content, size), 20dvw)' : '0'; NOTE: not supported in all browsers: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/calc-size#browser_compatibility
export const register = (name, tab) => {
  disposer = mobx.reaction(
    () => state.ui.tabs[name()] ? '20dvw' : '0',
    width => tab.style.width = width // NOTE: Workaround
  );
}

export const unregister = () => disposer();
