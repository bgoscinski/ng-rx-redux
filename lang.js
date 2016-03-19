export {
  createReducer,
  createComposingReducer,
  composeReducers,
  createStore,
} from './ng-rx-redux/index.js';

export * from './ng-rx-redux/vendor.js';

export const isObservable = (maybeObs) => {
  return maybeObs && typeof maybeObs.subscribe === 'function';
}
