import 'rxjs/add/observable/merge.js'
import 'rxjs/add/operator/map.js'
import 'rxjs/add/operator/switchMap.js'

import {Observable} from 'rxjs/Observable.js'
import {decorateState, bindState} from './helpers.js'
import {createReducer} from './createReducer.js'

export const createCombiningReducer = (reducingFn) => {
  return decorateState(createReducer(reducingFn), (rawState$, action$) => {
    return Observable.create((observer) => {
      const outerChanges$ = rawState$.publish()

      let reducers
      const sub = outerChanges$.subscribe((_reducers = []) => {
        reducers = _reducers

        for (let i = 0, len = reducers.length; i < len; i++) {
          bindState(reducers[i], action$)
        }
      })

      const innerChanges$ = outerChanges$
        .switchMap((collection = []) => Observable.merge(...collection))
        .map(() => reducers)

      sub.add(innerChanges$.subscribe(observer))
      sub.add(outerChanges$.subscribe(observer))

      outerChanges$.connect()

      return sub
    })
  })
}
