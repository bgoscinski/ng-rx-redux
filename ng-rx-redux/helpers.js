import {eq, mapKeys, forEach, flowRight, functions} from 'lodash'
import {
  Observable,
  BehaviorSubject,
  map,
  distinctUntilChanged,
  publish,
  startWith,
  scan,
  switchMap,
  mergeStatic,
  combineLatestStatic,
} from './vendor.js'

const reducerBindings = new WeakMap();

const createState = (bindReducer, initValue) => {
  const state$ = new BehaviorSubject(initValue);

  reducerBindings.set(state$, (action$, postMiddlewares) => {
    reducerBindings.delete(state$);
    bindReducer(state$, action$, postMiddlewares);
  });

  return state$;
}

const decorateState = (state$, decorator) => {
  const originalBind = reducerBindings.get(state$);

  if (!originalBind) {
    throw new Error();
  }

  reducerBindings.set(state$, (action$, postMiddlewares = []) => {
    originalBind(action$, [decorator, ...postMiddlewares]);
  })

  return state$;
}

const applyMiddlewares = (middlewares = [], base$, ...args) => {
  const apply = (base$, middleware) => middleware(base$, ...args) || base$
  return middlewares.reduce(apply, base$);
}



export const bindActionCreators = (actionCreators, dispatch, dest = {}) => {
  if (typeof actionCreators === 'function') {
    return flowRight(dispatch, actionCreators)
  }

  return functions(actionCreators).reduce((dest, creatorName) => {
    dest[creatorName] = flowRight(dispatch, actionCreators[creatorName]);
    return dest;
  }, dest);
}

export const createStore = (state$, preMiddlewares = [], postMiddlewares = []) => {
  let rawActions;
  const rawAction$ = Observable.create((observer) => {
    rawActions = observer
  });

  const getState = ::state$.getValue
  const middlewareApi = {getState, dispatch: (action) => dispatch(action)}

  const chain = preMiddlewares.map((middleware) => middleware(middlewareApi));
  const dispatch = chain.reduceRight(
    (next, middlewares) => middlewares(next),
    (action) => rawActions.next(action)
  );

  const action$ = rawAction$::publish()
  reducerBindings.get(state$)(action$, postMiddlewares);
  action$.connect();

  return {getState, dispatch};
}

export const createReducer = (reducingFn) => {
  return createState((state$, action$, middlewares = []) => {
    const rawState$ = action$
      ::startWith(undefined, {})
      ::scan(reducingFn)
      ::distinctUntilChanged();

    const processedState$ = applyMiddlewares(middlewares, rawState$, action$);
    state$.add(processedState$.subscribe(state$));
  });
}

export const composeReducers = (reducers) => {
  if (Array.isArray(reducers)) {
    return composeReducerList(reducers)
  }

  return composeReducerMap(reducers)
}

export const composeReducerMap = (reducersMap) => {
  const keys = Object.keys(reducersMap);
  const list = keys.map((name) => reducersMap[name]);

  return decorateState(_composeReducerList(list, {}), (state$) => {
    const keysMapper = (value, idx) => keys[idx];

    return state$::map((values) => {
      return mapKeys(values, keysMapper);
    })
  });
}

export const composeReducerList = (reducersList) => {
  return _composeReducerList(reducersList, [])
};

const _composeReducerList = (reducersList, initValue) => {
  return createState((state$, action$, middlewares = []) => {
    const rawState$ = combineLatestStatic(reducersList, (...values) => {
      return values;
    });

    const processedState$ = applyMiddlewares(middlewares, rawState$, action$);

    reducersList.forEach((reducer) => {
      reducerBindings.get(reducer)(action$);
    })

    state$.add(processedState$.subscribe(state$));
  }, initValue)
}

export const createComposingReducer = (reducingFn) => {
  return decorateState(createReducer(reducingFn), (rawState$, action$) => {
    return Observable.create((observer) => {
      const outerChanges$ = rawState$::publish();

      const tryBindReducer = (reducer) => {
        const bindReducer = reducerBindings.get(reducer)
        if (bindReducer) {
          bindReducer(action$);
        }
      };

      let reducers;
      const sub = outerChanges$.subscribe((_reducers) => {
        forEach(reducers = _reducers, tryBindReducer);
      });

      const innerChanges$ = outerChanges$
        ::switchMap((collection = []) => mergeStatic(...collection))
        ::map(() => reducers);

      sub.add(innerChanges$.subscribe(observer));
      sub.add(outerChanges$.subscribe(observer));

      outerChanges$.connect();

      return sub;
    })
  })
}
