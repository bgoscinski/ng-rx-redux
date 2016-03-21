import {forEach, flowRight, functions} from 'lodash'
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

export const bindActionCreators = (actionCreators, dispatch) => {
  if (typeof actionCreators === 'function') {
    return flowRight(dispatch, actionCreators);
  }

  const boundActionCreators = {};
  const actionCreatorNames = functions(actionCreators);

  for (let i = 0, len = actionCreatorNames.length; i < len; i++) {
    const creatorName = actionCreatorNames[i];
    const boundCreator = flowRight(dispatch, actionCreators[creatorName]);
    boundActionCreators[creatorName] = boundCreator;
  }

  return boundActionCreators;
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

export const combineReducers = (reducers) => {
  if (Array.isArray(reducers)) {
    return combineReducerList(reducers)
  }

  return combineReducerMap(reducers)
}

export const combineReducerMap = (reducersMap) => {
  const keys = Object.keys(reducersMap);
  const list = keys.map((name) => reducersMap[name]);

  return decorateState(_combineReducerList(list, {}), (state$) => {
    const toValuesMap = (valuesList) => {
      const valuesMap = {};

      for (let i = 0, len = keys.length; i < len; i++) {
        valuesMap[keys[i]] = valuesList[i]
      }

      return valuesMap;
    };

    return state$::map(toValuesMap)
  });
}

export const combineReducerList = (reducersList) => {
  return _combineReducerList(reducersList, [])
};

const _combineReducerList = (reducersList, initValue) => {
  return createState((state$, action$, middlewares = []) => {
    const toValuesList = (...values) => values;
    const rawState$ = combineLatestStatic(reducersList, toValuesList);
    const processedState$ = applyMiddlewares(middlewares, rawState$, action$);

    reducersList.forEach((reducer) => {
      reducerBindings.get(reducer)(action$);
    })

    state$.add(processedState$.subscribe(state$));
  }, initValue)
}

export const createCombiningReducer = (reducingFn) => {
  return decorateState(createReducer(reducingFn), (rawState$, action$) => {
    return Observable.create((observer) => {
      const outerChanges$ = rawState$::publish();

      let reducers;
      const sub = outerChanges$.subscribe((_reducers = []) => {
        reducers = _reducers;

        for (let i = 0, len = reducers.length; i < len; i++) {
          const bindReducer = reducerBindings.get(reducers[i])

          if (bindReducer) {
            bindReducer(action$);
          }
        }
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
