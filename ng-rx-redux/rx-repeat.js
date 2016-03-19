import {directive} from './module.js'

directive('rxRepeat', ['ngRepeatDirective', '$parseRxExpression', '$createRxExpression',
                       (ngRepeatDirective, $parseRxExpression, $createRxExpression) => {

  [ngRepeatDirective] = ngRepeatDirective;

  return {
    ...ngRepeatDirective,
    name: 'rxRepeat',
    compile($element, $attr) {
      const [obsName, asName, ngExp] = $parseRxExpression($attr.rxRepeat);
      const link = ngRepeatDirective.compile($element, {ngRepeat: ngExp});

      return ($scope, $element, $attr, ctrl, $transclude) => {
        $scope.$watchCollection = (exp, listener) => {
          delete $scope.$watchCollection; // let the prototypal inheritance do it's job next time
          const rxExpression = $createRxExpression([obsName, asName, asName]);
          $scope.$$rxWatchRxExpression(rxExpression).forEach(listener);
        }

        link($scope, $element, $attr, ctrl, $transclude);
      }
    }
  }
}])
