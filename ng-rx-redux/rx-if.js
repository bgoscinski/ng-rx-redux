import {directive} from './module.js'
import {parseExpression, watch} from './helpers.js'

directive('rxIf', (ngIfDirective, $parse) => {
  [ngIfDirective] = ngIfDirective;

  return {
    ...ngIfDirective,
    name: 'rxIf',
    compile: () => ($scope, $element, $attr, ctrl, $transclude) => {
      const {obsName, asName, ngExp} = parseExpression($attr.rxIf);

      $scope.$watch = (exp, listener) => {
        delete $scope.$watch;
        return watch($scope, obsName, asName, $parse(exp), listener);
      };

      ngIfDirective.link($scope, $element, {ngIf: ngExp}, ctrl, $transclude);
    }
  }
})
