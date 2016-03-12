import {directive} from './module.js'
import {parseExpression, watch} from './helpers.js'

directive('rxBind', (ngBindDirective, $parse) => {
  [ngBindDirective] = ngBindDirective;

  return {
    ...ngBindDirective,
    name: 'rxBind',
    compile: (element) => {
      const link = ngBindDirective.compile(element);
      return ($scope, $element, $attr) => {
        const {obsName, asName, ngExp} = parseExpression($attr.rxBind);

        $scope.$watch = (exp, listener) => {
          delete $scope.$watch;
          return watch($scope, obsName, asName, $parse(exp), listener);
        };

        link($scope, $element, {ngBind: ngExp});
      }
    }
  }
})
