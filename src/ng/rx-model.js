import angular from 'angular'
import 'rxjs/add/operator/map.js'
import 'rxjs/add/operator/publishBehavior.js'
import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject.js'
import {eq} from 'lodash'

import {directive} from './module.js'

directive('rxModel', (ngModelDirective, $compile, $parseRxExpression, $parse, $exceptionHandler) => {
  const priority = ngModelDirective[0].priority + 1

  const tryCall = (fn, arg1, arg2) => {
    try {
      fn(arg1, arg2)
    } catch (e) {
      $exceptionHandler(e)
    }
  }

  const hookNgModel = (rxModel, propertyName) => {
    const stream = new BehaviorSubject(rxModel.ngModel[propertyName])

    Object.defineProperty(rxModel.ngModel, propertyName, {
      enumerable: true,
      configurable: true,
      get: () => stream.getValue(),
      set(nextValue) {
        if (!eq(nextValue, stream.getValue())) {
          stream.next(nextValue)
        }
      }
    })

    stream.add(() => {
      Object.defineProperty(rxModel.ngModel, propertyName, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: stream.value
      })
    })

    rxModel.$scope.$on('$destroy', stream.unsubscribe.bind(stream))

    return stream
  }

  return {
    priority,
    scope: true,
    controllerAs: 'rxModel',
    controller: class RxModelController {
      constructor($scope, $element, $attrs) {
        this.$scope = $scope
        this.onNext = $parse($attrs.onNext)

        const [obsName, asName, ngExp] = $parseRxExpression($attrs.rxModel)
        const getter = $parse(ngExp)
        $scope.$rxWatchObservable(obsName)
          .map((formValue) => getter({[asName] : formValue}))
          .subscribe(this.value$ = new BehaviorSubject())

        $attrs.$set('ngModel', 'rxModel.getSetNgValue')
        $attrs.$set('ngModelOptions', angular.toJson({
          ...($attrs.rxModelOptions && $scope.$eval($attrs.rxModelOptions) || {}),
          ...($attrs.ngModelOptions && $scope.$eval($attrs.ngModelOptions) || {}),
          getterSetter: true
        }))

        $compile($element, null, priority)($scope)
        this.ngModel = $element.controller('ngModel')
      }

      getSetNgValue(value) {
        const currValue = this.value$.getValue()

        if (arguments.length && !eq(currValue, value)) {
          tryCall(this.onNext, this.$scope, {value})
        } else {
          return currValue
        }
      }

      get viewValue$() {
        return this._viewValue$ || (this._viewValue = hookNgModel(this, '$viewValue'))
      }

      get modelValue$() {
        return this._modelValue$ || (this._modelValue = hookNgModel(this, '$modelValue'))
      }

      get touched$() {
        return this._touched$ || (this._touched = hookNgModel(this, '$touched'))
      }

      get dirty$() {
        return this._dirty$ || (this._dirty = hookNgModel(this, '$dirty'))
      }

      get invalid$() {
        return this._invalid$ || (this._invalid = hookNgModel(this, '$invalid'))
      }
    }
  }
})
