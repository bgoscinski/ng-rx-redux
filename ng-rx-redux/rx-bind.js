import {directive} from './module.js'

directive('rxBind', ['ngBindDirective', '$parseRxExpression',
                     (ngBindDirective, $parseRxExpression) => {

  [ngBindDirective] = ngBindDirective;

  return {
    ...ngBindDirective,
    name: 'rxBind',
    compile: (element) => {
      const link = ngBindDirective.compile(element);
      return ($scope, $element, $attr) => {
        $scope.$watch = (exp, listener) => {
          delete $scope.$watch; // let the prototypal inheritance do it's job next time
          $scope.$$rxWatchRxExpression($attr.rxBind).forEach(listener);
        }

        const [/*obsName*/, /*asName*/, ngExp] = $parseRxExpression($attr.rxBind);
        link($scope, $element, {ngBind: ngExp});
      }
    }
  }
}])
