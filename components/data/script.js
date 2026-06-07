import '../tab/script.js';
import { addData } from '../../state/actions/score.js';
import state from '../../state/state.js';
import dropzone from '../../utils/dropzone.js';
import { isCSV } from '../../utils/type.js';

const html = await fetch('components/data/index.html').then(r => r.text());
const css = await fetch('components/data/style.css').then(r => r.text());
const global = await fetch('style.css').then(r => r.text());

const animate = ({ from, to, map }) =>
  map.forEach(([f, t]) => gsap.to(from.children[f], {
    duration: 1,
    morphSVG: to.children[t],
    ease: 'expo.inOut'
  }));

class Data extends HTMLElement {
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
    const label = this.shadowRoot.querySelector('label');
    const input = this.shadowRoot.querySelector('input');
    // noinspection CssInvalidHtmlTagReference
    const tab = this.shadowRoot.querySelector('ens-tab');

    tab.name = 'data';

    const upload = this.shadowRoot.querySelector('#upload');
    const csv = this.shadowRoot.querySelector('#csv');
    const error = this.shadowRoot.querySelector('#error');

    gsap.registerPlugin(MorphSVGPlugin);

    dropzone({
      handleFiles: addData,
      element: label,
      input,
      validation: files => {
        const valid = files.every(file => isCSV(file));
        if (valid) {
          animate({
            from: upload,
            to: csv,
            map: [[0, 0], [1, 3], [2, 2], [3, 1], [4, 4], [5, 5]]
          });
        } else {
          animate({
            from: upload,
            to: error,
            map: [[0, 0], [1, 2], [2, 1], [3, 3], [4, 2], [5, 2]]
          });
        }
      },
      clear: () =>
        animate({
          from: upload,
          to: upload,
          map: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]
        })
    });

    mobx.autorun(() => {
      tab.setAttribute('disabled', (state.current.score === null).toString());
    });
  }
}

customElements.define('ens-data', Data);
