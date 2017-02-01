(function() {

  function rand(...args) {
    const values = Array.isArray(args[0]) ? args[0] : args;
    return values[Math.floor(Math.random() * values.length)];
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
        '100% 0 0 0', '0 100% 0 0', '0 0 0 100%', '0 0 0 100%'
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
      _.opacity = rangeOf(.2, .9, .3);
      _.transform = `scale(${ rangeOf(.6, 1.8, .3) })`;
    },
    tiles(_) {
      _.backgroundColor = color();
      _.width = _.height = rangeOf(25, 125, 25) + '%';
      _.opacity = rangeOf(.2, .9, .3);
      _.transform = `scale(${ rangeOf(.6, 1.8, .3) })`;
    },
    pizza(_) {
      _.backgroundColor = color();
      _.opacity = rangeOf(.2, .9, .3);
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
      _.transform = `scale3d(${ rangeOf(.6, 1.8, .3) })`;
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

  function register() {
    customElements.define('pattern-graph', class extends HTMLElement {
      constructor() {
        super();
        this.cellsCount = parseInt(this.getAttribute('cells'), 10) || 25;
        this.type = this.getAttribute('type');
        this.attachShadow({ mode: 'open' }).innerHTML = `
          <style>
            :host {
              display: inline-block;
              position: relative;
            }
            :host(:after) {
              content: '';
              display: block;
              clear: both;
            }
            .cell {
              width: 20%;
              height: 20%;
              background: #fafafa;
              float: left;
              position: relative;
            }
            .shape {
              display: block;
              position: relative;
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
        this.addEventListener('click', () => this._buildPattern());
        this.addEventListener('touchstart', () => this._buildPattern());
      }
      connectedCallback() {
        this._eachShape(_ => {
          _.transitionDelay = rangeOf(600) + 'ms';
        });
        setTimeout(() => this._buildPattern(), rangeOf(200, 1000));
      }
      _eachShape(fn) {
        const shapes = this.shadowRoot.querySelectorAll('.shape');
        return [].map.call(shapes, shape => fn(shape.style, shape));
      }
      _buildPattern() {
        let builder = Patterns[this.type];
        if (builder) {
          this._eachShape(builder);
        }
      }
    });
  }

  if (window.customElements) {
    register();
  } else {
    let script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/custom-elements/1.0.0-alpha.3/custom-elements.min.js';
    document.body.appendChild(script);
    window.onload = register;
  }

}());
