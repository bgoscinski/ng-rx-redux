import {eq, mapKeys} from 'lodash'
import {forEach} from 'lodash/fp'
import {
  Observable,
  BehaviorSubject,
  map,
  distinctUntilChanged,
  share,
  publish,
  startWith,
  scan,
  switchMap,
  merge,
  mergeStatic,
  combineLatestStatic,
} from './vendor.js'

const reducerBindings = new WeakMap();

const createState = (bindReducer, initValue) => {
  const state$ = new BehaviorSubject(initValue);

  reducerBindings.set(state$, (action$, postMiddleware) => {
    reducerBindings.delete(state$);
    bindReducer(state$, action$, postMiddleware);
  });

  return state$;
}

const decorateState = (state$, decorator) => {
  const originalBind = reducerBindings.get(state$);

  if (!originalBind) {
    throw new Error();
  }

  reducerBindings.set(state$, (action$, postMiddleware = []) => {
    originalBind(action$, [decorator, ...postMiddleware]);
  })

  return state$;
}

const applyMiddleware = (middleware = [], base$, ...args) => {
  const apply = (base$, middleware) => middleware(base$, ...args) || base$
  return middleware.reduce(apply, base$);
}


export const watchify = () => {
  let isFirst = true;
  let prevValue;

  return this::map((value) => {
    if (isFirst) {
      prevValue = value;
      isFirst = false;
    }

    const ret = [value, prevValue];
    prevValue = value;

    return ret;
  })
}

export const createStore = (state$, preMiddleware = [], postMiddleware = []) => {
  const getState = () => state$.value;

  let observer;
  const dispatch = (action) => observer.next(action);
  const action$ = Observable.create((_observer) => {
    observer = _observer
  });

  const processedAction$ = applyMiddleware(preMiddleware, action$, {
    getState,
    dispatch
  })::share()

  reducerBindings.get(state$)(processedAction$, postMiddleware);
  // processedAction$.connect();

  return {action$: processedAction$, getState, dispatch};
}

export const createReducer = (reducingFn) => {
  return createState((state$, action$, middleware = []) => {
    const rawState$ = action$
      ::startWith(undefined, {})
      ::scan(reducingFn)
      ::distinctUntilChanged();

    const processedState$ = applyMiddleware(middleware, rawState$, action$);
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
  return createState((state$, action$, middleware = []) => {
    const rawState$ = combineLatestStatic(reducersList, (...values) => {
      return values;
    });

    const processedState$ = applyMiddleware(middleware, rawState$, action$);

    forEach((reducer) => {
      reducerBindings.get(reducer)(action$);
    }, reducersList)

    state$.add(processedState$.subscribe(state$));
  }, initValue)
}

export const createComposingReducer = (reducingFn) => {
  return decorateState(createReducer(reducingFn), (rawState$, action$) => {
    return Observable.create((observer) => {
      const outerChanges$ = rawState$::publish();

      const bindReducers = forEach((reducer) => {
        const bindReducer = reducerBindings.get(reducer)
        if (bindReducer) {
          bindReducer(action$);
        }
      });

      let reducers;
      const sub = outerChanges$.subscribe((_reducers) => {
        bindReducers(reducers = _reducers);
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
