import {directive} from './module.js'

directive('rxIf', ['ngIfDirective', '$parseRxExpression',
                   (ngIfDirective, $parseRxExpression) => {

  [ngIfDirective] = ngIfDirective;

  return {
    ...ngIfDirective,
    name: 'rxIf',
    compile: () => ($scope, $element, $attr, ctrl, $transclude) => {
      $scope.$watch = (exp, listener) => {
        delete $scope.$watch; // let the prototypal inheritance do it's job next time
        $scope.$$rxWatchRxExpression($attr.rxIf).forEach(listener);
      }

      const [/*obsName*/, /*asName*/, ngExp] = $parseRxExpression($attr.rxIf);
      ngIfDirective.link($scope, $element, {ngIf: ngExp}, ctrl, $transclude);
    }
  }
}])
