import 'rxjs/add/operator/publish.js'
import {Observable} from 'rxjs/Observable.js'
import {bindState} from './helpers.js'

export const createStore = (state$, preMiddlewares = [], postMiddlewares = []) => {
  let rawActions
  const rawAction$ = Observable.create((observer) => {
    rawActions = observer
  })

  const getState = () => state$.getValue()
  const middlewareApi = {getState, dispatch: (action) => dispatch(action)}

  const chain = preMiddlewares.map((middleware) => middleware(middlewareApi))
  const dispatch = chain.reduceRight(
    (next, middlewares) => middlewares(next),
    (action) => rawActions.next(action)
  )

  const action$ = rawAction$.publish()
  bindState(state$, action$, postMiddlewares)
  action$.connect()

  return {getState, dispatch}
}
