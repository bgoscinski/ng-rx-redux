import rxReduxState from './ng-rx-redux/index.js';
import angular from 'angular';
import 'angular-animate';

const module = angular.module('app', [
  'ngAnimate',
  rxReduxState.name
]);

export default module;
export const {
  constant,
  value,
  provider,
  config,
  factory,
  service,
  directive,
  component,
} = module;

export const constantFactory = (name, factoryFn) => {
  const createAndRegister = ['$injector', '$provide', ($injector, $provide) => {
    $provide.constant(name, $injector.invoke(factoryFn))
  }];

  module._invokeQueue.push(['$injector', 'invoke', [createAndRegister]]);
}

