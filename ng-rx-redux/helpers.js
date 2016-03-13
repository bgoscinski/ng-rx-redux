import Rx from 'rx';

const bind = Symbol('ngRxRedux: bind');

const disposeTogether = (parentDisposable, childDisposable) => {
  parentDisposable.dispose = () => {
    delete parentDisposable.dispose;
    childDisposable.dispose();
    return parentDisposable.dispose();
  };
};

export const createStore = (state$, preMiddleware = [], postMiddleware = []) => {
  const rawAction$ = new Rx.Subject();
  const getState = () => state$.value;
  const dispatch = (action) => rawAction$.onNext(action);

  const action$ = preMiddleware
    .reduce((action$, middleware) => {
      return middleware(action$, {
        getState,
        dispatch
      }) || action$
    }, rawAction$);

  state$[bind](action$, postMiddleware);

  return {
    action$: rawAction$,
    getState,
    dispatch
  };
}

const forEach = (collection, callback) => {
  if (collection) {
    if (collection.forEach) {
      collection.forEach(callback)
    } else {
      const keys = Object.keys(collection);
      for (let i = 0, len = keys.length; i < len; i++) {
        callback(collection[keys[i]]);
      }
    }
  }
}

export const createComposingReducer = (reducingFn) => {
  const state$ = createReducer(reducingFn);

  const handleSubs = (action$) => (rawState$) => {
    let oldSubs = new Map();

    return Rx.Observable.create((observer) => {
      let reducers;
      const onChange = () => { observer.onNext(reducers) }

      const onNext = (_reducers) => {
        const newSubs = new Map();
        reducers = _reducers;

        forEach(reducers, (reducer) => {
          const subscription = oldSubs.get(reducer);

          if (subscription) { // known one
            newSubs.set(reducer, subscription)
            oldSubs.delete(reducer);
          } else { // new one
            reducer[bind](action$);
            newSubs.set(reducer, reducer.subscribe(onChange));
          }
        })

        oldSubs.forEach((subscription) => {
          subscription.dispose();
        })

        oldSubs.clear();
        oldSubs = newSubs;
        onChange();
      };
      const onError = (e) => { observer.onError(e); }
      const onCompleted = () => { observer.onCompleted(); }

      return rawState$.subscribe(onNext, onError, onCompleted);
    });
  }

  const bindReducer = state$[bind];
  state$[bind] = (action$, middleware = []) => {
    bindReducer(action$, [
      handleSubs(action$),
      ...middleware
    ])
  };

  return state$;
}

export const createReducer = (reducingFn) => {
  const state$ = new Rx.BehaviorSubject();

  state$[bind] = (action$, middleware = []) => {
    delete state$[bind];

    const rawState$ = action$
      .startWith({})
      .scan(reducingFn, undefined)
      .distinctUntilChanged();

    const subscription = middleware
      .reduce((state$, middleware) => {
        return middleware(state$) || state$;
      }, rawState$)
      .subscribe((nextState) => {
        state$.onNext(nextState);
      })

    disposeTogether(state$, subscription)
  };

  return state$;
};

const observableMap = (reducersMap) => {
  const state$ = new Rx.BehaviorSubject({});

  state$[bind] = (action$, middleware = []) => {
    delete state$[bind];

    const keys = Object.keys(reducersMap);
    const reducersList = keys.map((name) => reducersMap[name]);
    const {length} = keys;

    const combine = function () {
      const nextState = {};
      for (let i = 0; i < length; i++) nextState[keys[i]] = arguments[i];
      return nextState;
    };

    const rawState$ = Rx.Observable
      .combineLatest(...reducersList, combine);

    const subscription = middleware
      .reduce((state$, middleware) => {
        return middleware(state$) || state$;
      }, rawState$)
      .subscribe((nextState) => {
        state$.onNext(nextState)
      });

    disposeTogether(state$, subscription)

    reducersList.forEach((reducingFn) => {
      reducingFn[bind](action$);
    })
  }

  return state$;
}

const observableList = (reducersList) => {
  const state$ = new Rx.BehaviorSubject([]);

  state$[bind] = (action$, middleware = []) => {
    delete state$[bind];

    const rawState$ = Rx.Observable
      .combineLatest(...reducersList)

    const subscription = middleware
      .reduce((state$, middleware) => {
        return middleware(state$) || state$;
      }, rawState$)
      .subscribe((nextState) => {
        state$.onNext(nextState);
      });

    disposeTogether(state$, subscription)

    reducersList.forEach((reducingFn) => {
      reducingFn[bind](action$);
    })
  }

  return state;
};


export const composeReducers = (reducers) => {
  if (Array.isArray(reducers)) {
    return observableList(reducers)
  }

  return observableMap(reducers)
}

export const parseExpression = (exp) => {
  const [obsPart, ...ngExp] = exp.split(': ');
  const [, obsName, asName] = obsPart.trim().match(/^([\s\S]+) as (\w+)$/);

  return {
    obsName: obsName.trim(),
    asName: asName ? asName.trim() : 'value',
    ngExp: ngExp.join(':').trim()
  }
};

export const neq = (o1, o2) => (
  o1 !== o2 &&
  o1 === o1 && // isNaN
  o2 === o2    // isNaN
)

export const watch = ($scope, obsName, asName, get, listener) => {
  let dispose;
  let isFirst = true;
  let oldVal;

  const onChange = (obsVal) => {
    const newVal = get($scope, {[asName]: obsVal});

    if (isFirst) {
      isFirst = false;
      oldVal = newVal;
      listener(newVal, newVal);
    } else if (neq(oldVal, newVal)) {
      let prevVal = oldVal;
      oldVal = newVal;
      listener(newVal, prevVal);
    }
  };


  $scope.$watch(obsName, (observable) => {
    if (dispose) { dispose = dispose(); }
    if (observable && observable.subscribe) {
      const subscription = observable.subscribe((newVal) => {
        if ($scope.$$phase) {
          $scope.$apply(() => { onChange(newVal); })
        } else {
          onChange(newVal);
        }
      });

      dispose = () => { subscription.dispose(); }
    }
  })

  const tryDispose = () => { dispose && dispose() };
  $scope.$on('$destroy', tryDispose);
  return tryDispose;
}
