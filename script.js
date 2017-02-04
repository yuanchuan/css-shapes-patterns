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

  const Patterns = {
    origin(_) {
      _.backgroundColor = color();
      _.borderRadius = rand(
        '100% 0 0 0', '0 100% 0 0', '0 0 100% 0', '0 0 0 100%'
      );
    },
    triangle(_) {
      _.backgroundColor = color();
      _.clipPath = _.webkitClipPath = `polygon(${ rand(
        '0 0, 100% 0, 100% 100%', '100% 0, 100% 100%, 0 100%',
        '0 0, 100% 100%, 0 100%', '0 0, 100% 0, 100% 100%'
      )})`;
    },
    diamond(_) {
      _.backgroundColor = color();
      _.clipPath = _.webkitClipPath = `polygon(${ rand(
        '0 0, 50% 0, 100% 100%, 0% 50%', '50% 0, 100% 0, 100% 50%, 0 100%',
        '0 0, 100% 50%, 100% 100%, 50% 100%', '0 50%, 100% 0, 50% 100%, 0 100%'
      )})`;
    },
    circles(_) {
      _.backgroundColor = color();
      _.borderRadius = '50%';
      _.width = _.height = rangeOf(25, 125, 25) +  '%';
      _.opacity = rangeOf(.2, .9, .2);
      _.transform = `scale(${ rangeOf(.6, 1.8, .3) })`;
    },
    tiles(_) {
      _.backgroundColor = color();
      _.width = _.height = rangeOf(25, 125, 25) + '%';
      _.opacity = rangeOf(.2, .9, .2);
      _.transform = `scale(${ rangeOf(.6, 1.8, .3) })`;
    },
    pizza(_) {
      _.backgroundColor = color();
      _.opacity = rangeOf(.2, .9, .2);
      _.clipPath = _.webkitClipPath = `polygon(
        ${rangeOf(0, 100, 20) + '%'} ${rangeOf(0, 100, 20) + '%'},
        ${rangeOf(0, 100, 20) + '%'} ${rangeOf(0, 100, 20) + '%'},
        ${rangeOf(0, 100, 20) + '%'} ${rangeOf(0, 100, 20) + '%'}
      )`;
      _.transform = `
        scale( ${ rand(1, 2.5, .3) })
      `;
    },
    leaves(_) {
      _.backgroundColor = color();
      _.borderRadius = rand('100% 0', '0 100%');
      _.width = _.height = rangeOf(25, 125, 25) + '%';
      _.opacity = rangeOf(.2, .9, .3);
      _.transform = `scale(${ rangeOf(.6, 1.8, .3) })`;
    },
    ribbons(_) {
      _.border = `${ rangeOf(2, 5) + 'px' } solid ${ color() }`;
      _.opacity = rangeOf(.2, .9, .3);
      _.borderRadius = '50%';
      _.transform = `scale( ${ rangeOf(2, 30) })`;
    },
    squares(_) {
      _.border = `${ rangeOf(2, 10) + 'px' } solid ${ color() }`;
      _.opacity = rangeOf(.2, .8, .2);
      _.width = _.height = rangeOf(25, 200, 25) + '%';
      _.transform = 'rotate(45deg)';
    },
    lines(_) {
      _.backgroundColor = color();
      _.opacity = rangeOf(.2, .9, .3);
      _.height = rangeOf(1, 5) + 'px';
      _.transform = `
        scale( ${ rand(2, 2.5, 3, 3.5) })
        rotate( ${ rangeOf(25, 100, 25) + 'deg' })
      `;
    },
    curves(_) {
      _.opacity = rangeOf(.2, .9, .3);
      _.borderRadius = '50%';
      _.borderTop = `${ rangeOf(1, 10) + 'px' } solid ${ color() }`;
      _.width = _.height = rangeOf(25, 200) + '%';
      _.transform = `
        scale( ${ rand(1, 1.5, 1.8, 2) })
        rotate( ${ rangeOf(25, 360) + 'deg' })
      `;
    }
  };

  if (!window.customElements) {
    let script = document.createElement('script');
    script.src = 'polyfills/custom-elements.min.js';
    document.body.appendChild(script);
  }

  window.addEventListener('load', () => {
    customElements.define('x-graph', class extends HTMLElement {
      constructor() {
        super();
        this.cellsCount = parseInt(this.getAttribute('cells'), 10) || 25;
        this.type = this.getAttribute('type');
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
      _buildPattern(builder = Patterns[this.type]) {
        if (builder) {
          this._eachShape(builder);
        }
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
