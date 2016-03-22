import 'rxjs/add/observable/combineLatest.js'
import 'rxjs/add/operator/map.js'
import {Observable} from 'rxjs/Observable.js'
import {
  applyMiddlewares,
  bindState,
  createState,
  decorateState
} from './helpers.js'

export const combineReducers = (reducers) => {
  if (Array.isArray(reducers)) {
    return combineReducerList(reducers)
  }

  return combineReducerMap(reducers)
}

const combineReducerMap = (reducersMap) => {
  const keys = Object.keys(reducersMap)
  const list = keys.map((name) => reducersMap[name])

  return decorateState(_combineReducerList(list, {}), (state$) => {
    const toValuesMap = (valuesList) => {
      const valuesMap = {}

      for (let i = 0, len = keys.length; i < len; i++) {
        valuesMap[keys[i]] = valuesList[i]
      }

      return valuesMap
    }

    return state$.map(toValuesMap)
  })
}

const _combineReducerList = (reducersList, initValue = []) => {
  return createState((state$, action$, middlewares) => {
    const toValuesList = (...values) => values
    const rawState$ = Observable.combineLatest(reducersList, toValuesList)
    const processedState$ = applyMiddlewares(middlewares, rawState$, action$)

    for (let i = 0, len = reducersList.length; i < len; i++) {
      bindState(reducersList[i], action$)
    }

    state$.add(processedState$.subscribe(state$))
  }, initValue)
}
