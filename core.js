import rxReduxState from './ng-rx-redux/index.js';
import angular from 'angular';
import 'angular-animate';

const module = angular.module('app', [
  'ngAnimate',
  rxReduxState.name
]);

export const constant = (name, value) => { module.constant(name, value) }
export const value = (name, value) => { module.value(name, value) }
export const provider = (name, value) => { module.provider(name, value) }
export const config = (configFn) => { module.config(configFn) }
export const factory = (name, value) => { module.factory(name, value) }
export const service = (name, value) => { module.service(name, value) }
export const directive = (name, value) => { module.directive(name, value) }
export const component = (name, value) => { module.component(name, value) }
