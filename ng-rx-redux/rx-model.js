import {eq} from 'lodash'
import {get, set} from 'lodash/fp'
import {directive} from './module.js'
import {distinctUntilChanged, map, BehaviorSubject, share} from './vendor.js'


directive('rxModel', (ngModelDirective, $compile, $parseRxExpression, $parse, $exceptionHandler) => {
  const priority = ngModelDirective[0].priority + 1;

  const tryCall = (fn, arg1, arg2) => {
    try {
      fn(arg1, arg2);
    } catch (e) {
      $exceptionHandler(e);
    }
  }

  const hookNgModel = (rxModel, propertyName) => {
    const stream = new BehaviorSubject(rxModel.ngModel[propertyName])

    Object.defineProperty(rxModel.ngModel, propertyName, {
      enumerable: true,
      configurable: true,
      get: ::stream.getValue,
      set(nextValue) {
        if (!eq(nextValue, stream.getValue())) {
          stream.next(nextValue)
        }
      }
    });

    stream.add(() => {
      Object.defineProperty(rxModel.ngModel, propertyName, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: stream.value
      });
    })

    rxModel.$scope.$on('$destroy', ::stream.unsubscribe);

    return stream;
  }

  return {
    priority,
    scope: true,
    controllerAs: 'rxModel',
    controller: class RxModelController {
      constructor($scope, $element, $attrs) {
        this.$scope = $scope;
        this.$element = $element;

        const [obsName, asName, ngExp] = $parseRxExpression($attrs.rxModel);
        this.onNext = $attrs.onNext && $parse($attrs.onNext);
        this.onNextForm = $attrs.onNextForm && $parse($attrs.onNextForm);

        const getter = $parse(ngExp);
        const getNestValue = (formValue) => {
          return getter({[asName] : formValue})
        };

        if (this.onNextForm) {
          const setter = set(ngExp);
          this.getNextFormValue = (nestValue, formValue) => {
            return setter(nestValue, {[asName]: formValue})[asName]
          }
        }

        $scope.$rxWatchObservable(obsName).subscribe((formValue) => {
          this.nestValue = getNestValue(formValue);

          if (this.onNextForm) {
            this.formValue = formValue;
          }
        })

        this.ngOptions = {
          ...($attrs.rxModelOptions && $scope.$eval($attrs.rxModelOptions) || {}),
          ...($attrs.ngModelOptions && $scope.$eval($attrs.ngModelOptions) || {}),
          getterSetter: true
        };

        $attrs.$set('ngModel', 'rxModel.getSetNgValue');
        $attrs.$set('ngModelOptions', 'rxModel.ngOptions');
        $compile($element, null, priority)($scope);

        this.ngModel = this.$element.controller('ngModel');
      }

      getSetNgValue(value) {
        return arguments.length ? this.setNgValue(value) : this.nestValue;
      }

      setNgValue(nextNest) {
        if (this.onNext && !eq(this.nestValue, nextNest)) {
          tryCall(this.onNext, this.$scope, {value: nextNest});
        }

        if (this.onNextForm) {
          let nextForm = this.getNextFormValue(nextNest, this.formValue);
          tryCall(this.onNextForm, this.$scope, {value: nextForm});
        }
      }

      get viewValue$() {
        return this._viewValue$ || (this._viewValue = hookNgModel(this, '$viewValue'));
      }

      get modelValue$() {
        return this._modelValue$ || (this._modelValue = hookNgModel(this, '$modelValue'));
      }

      get touched$() {
        return this._touched$ || (this._touched = hookNgModel(this, '$touched'));
      }

      get dirty$() {
        return this._dirty$ || (this._dirty = hookNgModel(this, '$dirty'));
      }

      get invalid$() {
        return this._invalid$ || (this._invalid = hookNgModel(this, '$invalid'));
      }
    }
  }
})
