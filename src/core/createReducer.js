import 'rxjs/add/operator/distinctUntilChanged.js'
import 'rxjs/add/operator/startWith.js'
import 'rxjs/add/operator/scan.js'

import {createState, applyMiddlewares} from './helpers.js'

export const createReducer = (reducingFn) => {
  return createState((state$, action$, middlewares) => {
    const rawState$ = action$
      .startWith(undefined, {})
      .scan(reducingFn)
      .distinctUntilChanged()

    const processedState$ = applyMiddlewares(middlewares, rawState$, action$)
    state$.add(processedState$.subscribe(state$))
  })
}
