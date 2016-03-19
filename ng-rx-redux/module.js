import {
  angular,

  Observable,
  map,
  distinctUntilChanged,
  share,
  filter,
  switchOperator
} from './vendor.js';

const module = angular.module('rxReduxState', []);

export default module;
export const {directive, constant, config} = module;

constant('$parseRxExpression', (exp) => {
  const [obsPart, ...ngExpression] = exp.split(': ');
  const [, obsName, asName] = obsPart.trim().match(/^([\s\S]+) as (\w+)$/);

  return [
    obsName.trim(),
    asName ? asName.trim() : 'value',
    ngExpression.join(': ').trim()
  ]
})

constant('$createRxExpression', ([obsName, asName, ngExpression]) => {
  return `${obsName} as ${asName}: ${ngExpression}`;
})


config(['$provide', ($provide) => {
  $provide.decorator('$rootScope', ['$delegate', '$parse', '$parseRxExpression',
                                    ($delegate, $parse, $parseRxExpression) => {

    Object.assign($delegate.constructor.prototype, {
      $$safeApply,

      $$rxWatch,
      $rxWatch(ngExpression, objectEquality) {
        return this.$$rxWatch(ngExpression, objectEquality)::share();
      },

      $$rxWatchObservable,
      $rxWatchObservable(ngExpression) {
        return this.$$rxWatchObservable(ngExpression)::share();
      },

      $$rxWatchRxExpression,
      $rxWatchRxExpression(rxExpression) {
        return this.$$rxWatchRxExpression(rxExpression)::share();
      }
    });

    return $delegate;

    function $$safeApply(fn, ...args) {
      if (this.$$phase || this.$root.$$phase) {
        fn(...args);
      } else {
        this.$apply(() => { fn(...args) });
      }
    }

    function $$rxWatch(ngExpression, objectEquality) {
      return Observable.create((observer) => {
        return this.$watch(ngExpression, ::observer.next);
      })
    }

    function $$rxWatchObservable (ngExpression) {
      return Observable.create((observer) => {
        const subscription = this
          ::$$rxWatch(ngExpression)
          ::filter((value) => value && typeof value.subscribe === 'function')
          ::switchOperator()
          .subscribe(
            this.$$safeApply.bind(this, ::observer.next),
            this.$$safeApply.bind(this, ::observer.error),
            this.$$safeApply.bind(this, ::observer.complete)
          )

        this.$on('$destroy', ::subscription.unsubscribe);
        return subscription;
      })
    }

    function $$rxWatchRxExpression(rxExpression) {
      const [obsName, asName, ngExpression] = $parseRxExpression(rxExpression);
      const parsedNgExp = $parse(ngExpression);

      return this
        ::$$rxWatchObservable(obsName)
        ::map((value) => parsedNgExp(this, {[asName]: value}))
        ::distinctUntilChanged()
    }
  }])
}])
