(function() {

  function rand() {
    const args = Array.isArray(arguments[0]) ? arguments[0] : arguments;
    return args[Math.floor(Math.random() * args.length)];
  }

  function color(alpha = 1) {
    return rand(
      `rgba(39, 40, 132, ${ alpha })`,
      `rgba(199, 48, 149, ${ alpha })`,
      `rgba(144, 39, 138, ${ alpha })`,
      `rgba(76, 32, 127, ${ alpha })`
    );
  }

  const rangeOf = (function() {
    const memo = {};
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
        this.cellsCount = 25;
        this.builder = `function(_, __, index, setvar) { ${
          this.innerHTML
            .replace(/&gt;/g, '>')
            .replace(/&lt;/g, '<')
            .replace(/&amp;/g, '&')
        }}`;
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
      setvar(name, value) {
        if (!this.vars) this.vars = {};
        let key = this.vars[name];
        if (key && (+new Date()) - key.stamp <= 500) {
          return key.value;
        }
        this.vars[name] = {
          value: value,
          stamp: +new Date()
        };
        return value;
      }
      _eachShape(fn) {
        const shapes = this.shadowRoot.querySelectorAll('.shape');
        return [].map.call(shapes, (shape, index) => (
          fn.call(
            this,
            shape.style,
            shape.parentNode.style,
            index,
            this.setvar.bind(this)
          )
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
