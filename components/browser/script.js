import '../file/script.js';
import { file as createFile } from '../../utils/state.js';

const html = await fetch('components/browser/index.html').then(r => r.text());

class Browser extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = html;
  }

  // noinspection JSUnusedGlobalSymbols
  connectedCallback() {
    document.addEventListener('ens-mount', async () => {
      const dir = await showDirectoryPicker({ startIn: 'documents' });

      for await (const [name, handle] of dir.entries()) {
        if (name.startsWith('.')) continue;

        const id = await createFile(name, handle);

        const file = document.createElement('ens-file');
        file.textContent = name;
        file.setAttribute('ens-id', id);
        switch (name.split('.').at(-1)) {
          case 'csv':
            file.setAttribute('type', 'csv');
            break;
          case 'mp3':
          case 'wav':
          case 'ogg':
          case 'aac':
          case 'm4a':
          case 'm4b':
          case 'mp4':
          case 'wma':
          case 'webm':
            file.setAttribute('type', 'audio');
            break;
          default:
            file.setAttribute('type', 'other');
        }
        this.shadowRoot.querySelector('div').appendChild(file);
      }
    });
  }
}

customElements.define('ens-browser', Browser);
