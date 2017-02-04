(function() {

  function rand() {
    const args = Array.isArray(arguments[0]) ? arguments[0] : arguments;
    return args[Math.floor(Math.random() * args.length)];
  }

  function color() {
    return rand('#272884', '#c73095', '#90278a', '#4c207f');
  }

  const rangeOf = (function() {
    const memo = [];
    return function(start = 0, stop, step = 1) {
      let key = [].join.call(arguments, '-');
      let result = memo[key];
      if (Array.isArray(result)) {
        return rand(result);
      }
      const range = [];
      stop || (stop = start, start = 0);
      while ((step > 0 && start < stop) || (step < 0 && start > stop)) {
        range.push(start);
        start += step;
      }
      return rand(memo[key] = range);
    }
  }());

  function polyfill(cond, src) {
    if (!cond) {
      let script = document.createElement('script');
      script.src = 'polyfills/' + src;
      document.body.appendChild(script);
    }
  }
  polyfill(window.customElements, 'custom-elements.min.js');
  polyfill(document.head.attachShadow, 'shadydom.min.js');

  window.addEventListener('load', () => {
    customElements.define('x-pattern', class extends HTMLElement {
      constructor() {
        super();
        this.cellsCount = parseInt(this.getAttribute('cells'), 10) || 25;
        this.builder = `function(_, cell, index) {
          ${ this.innerHTML }
        }`;
        this.attachShadow({ mode: 'open' }).innerHTML = `
          <style>
            :host {
              display: inline-block;
              position: relative;
              -webkit-user-select: none;
              user-select: none;
            }
            :host(:after) {
              content: '';
              display: block;
              clear: both;
              visibility: hidden;
            }
            .cell {
              position: relative;
              width: 20%;
              height: 20%;
              background: #fafafa;
              float: left;
            }
            .shape {
              position: absolute;
              width: 100%;
              height: 100%;
              transition: all .3s ease;
              transform-origin: center center;
              z-index: 1;
            }
          </style>
          ${
            '<div class="cell"><div class="shape"></div></div>'
            .repeat(this.cellsCount)
          }
        `;
      }
      connectedCallback() {
        if ('ontouchstart' in document) {
          let timer;
          this.addEventListener('touchstart', () => {
            timer = setTimeout(() => this._buildPattern(), 100);
          });
          this.addEventListener('touchmove', () => clearTimeout(timer));
        } else {
          this.addEventListener('click', () => this._buildPattern());
        }
        this._eachShape(_ => {
          _.transitionDelay = rangeOf(600) + 'ms';
        });
        setTimeout(() => this._buildPattern(), rangeOf(200, 1000));
      }
      _eachShape(fn) {
        const shapes = this.shadowRoot.querySelectorAll('.shape');
        return [].map.call(shapes, (shape, index) => (
          fn(shape.style, shape, index)
        ));
      }
      _buildPattern() {
        eval(`this._eachShape(${ this.builder })`);
      }
    });
  });

  window.addEventListener('error', () => {
    document.body.className += 'oldie';
    let shot = document.querySelector('.fallback img');
    if (shot) {
      shot.src = shot.getAttribute('data-src');
    }
  });

}());
