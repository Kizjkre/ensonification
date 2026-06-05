import 'https://cdn.jsdelivr.net/npm/vega@6.2.0';
import 'https://cdn.jsdelivr.net/npm/vega-lite@6.4.3';
import 'https://cdn.jsdelivr.net/npm/vega-embed@7.1.0';

const html = await fetch('components/score/index.html').then(r => r.text());

class Score extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = html;
  }

  // noinspection JSUnusedGlobalSymbols
  connectedCallback() {
    const vlSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
      data: {
        values: [
          { a: 'C', b: 2 },
          { a: 'C', b: 7 },
          { a: 'C', b: 4 },
          { a: 'D', b: 1 },
          { a: 'D', b: 2 },
          { a: 'D', b: 6 },
          { a: 'E', b: 8 },
          { a: 'E', b: 4 },
          { a: 'E', b: 7 }
        ]
      },
      mark: 'bar',
      encoding: {
        y: { field: 'a', type: 'nominal' },
        x: {
          aggregate: 'average',
          field: 'b',
          type: 'quantitative',
          axis: {
            title: 'Average of b'
          }
        }
      }
    };

    vegaEmbed(this.shadowRoot.querySelector('#score'), vlSpec);
  }
}

customElements.define('ens-score', Score);
