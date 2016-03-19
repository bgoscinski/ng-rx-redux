import {component} from 'core.js';
import {map, BehaviorSubject} from 'lang.js';

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
    <pre>{{$ctrl.debugValue}}</pre>
  `,

  bindings: {
    observe: '@?',
    observable: '<?'
  },

  controller: class DebugCmp {
    constructor($element, $injector, $animate, $scope) {
      this.$element = $element;
      this.$injector = $injector;
      this.$animate = $animate;
      this.$scope = $scope;

      $element.css({
        ...NORMAL_STYLES,
        float: 'right',
        overflow: 'visible',
        margin: '0 10px',
        transition: '0.25s linear all',
      });
    }

    $onInit() {
      if (!this.observable) {
        this.observable = this.$injector.get(this.observe)
      }

      const replacer = (key, value) => {
        if (value instanceof BehaviorSubject) {
          return value.value;
        }

        return value;
      }

      this.$scope.$rxWatchObservable('$ctrl.observable')
        ::map((value) => JSON.stringify(value, replacer, 2))
        .subscribe(::this.update)
    }

    update(debugValue) {
      this.debugValue = debugValue;
      this.$animate.animate(this.$element, NORMAL_STYLES, CHANGED_STYLES)
        .then(() => {
          this.$animate.animate(this.$element, CHANGED_STYLES, NORMAL_STYLES)
        });
    }
  },
})
