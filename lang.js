export {observableState, observableList, observableMap} from './ng-rx-redux/index.js';
export {default as Rx} from 'rx';
export {default as angular} from 'angular';

export const selfProvider = (provider) => ({
  $get() {
    delete provider.$get;
    return provider;
  }
})
