import {directive} from './module.js'
import {parseExpression, watch} from './helpers.js'

directive('rxRepeat', (ngRepeatDirective, $parse) => {
  [ngRepeatDirective] = ngRepeatDirective;
  return {
    ...ngRepeatDirective,
    name: 'rxRepeat',
    compile($element, $attr) {
      const {obsName, asName, ngExp} = parseExpression($attr.rxRepeat);
      const link = ngRepeatDirective.compile($element, {ngRepeat: ngExp});

      return ($scope, $element, $attr, ctrl, $transclude) => {
        $scope.$watchCollection = (exp, listener) => {
          delete $scope.$watchCollection;
          return watch($scope, obsName, asName, $parse(exp), listener);
        };

        link($scope, $element, $attr, ctrl, $transclude);
      }
    }
  }
})
