import {component} from 'core.js';
import {Rx} from 'lang.js';

const CHANGED_STYLES = {
  outline: '2px solid rgba(0, 0, 255, 1)',
  background: 'rgba(0,0,255, 0.15)'
}

const NORMAL_STYLES = {
  outlineColor: 'rgba(0, 0, 255, 0)',
  background: 'white'
}

component('debugCmp', {
  template: `
    <div><strong>{{$ctrl.observe}}:</strong></div>
    <pre>{{$ctrl.debugInfo}}</pre>
  `,

  bindings: {
    observe: '@'
  },

  controller: class DebugCmp {
    constructor($element, $injector, $animate) {
      this.$element = $element;
      this.$injector = $injector;
      this.$animate = $animate;

      $element.css({
        ...NORMAL_STYLES,
        float: 'right',
        overflow: 'visible',
        margin: '0 10px',
        transition: '0.25s linear all',
      });
    }

    $onInit() {
      this.$injector.get(this.observe)
        .map((value) => JSON.stringify(value, null, 2))
        .subscribe((text) => { this.update(text); })
    }

    update(debugInfo) {
      this.debugInfo = debugInfo;
      this.$animate.animate(this.$element, NORMAL_STYLES, CHANGED_STYLES)
        .then(() => {
          this.$animate.animate(this.$element, CHANGED_STYLES, NORMAL_STYLES)
        });
    }
  },
})
