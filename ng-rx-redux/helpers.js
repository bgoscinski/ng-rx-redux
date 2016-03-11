import Rx from 'rx';

export const observableState = (actionsProvider) => (reducer) => {
  const state = new Rx.BehaviorSubject();

  const disposable = actionsProvider
    .startWith({})
    .scan(reducer, undefined)
    .distinctUntilChanged()
    .subscribe((nextState) => {
      state.onNext(nextState);
    });

  state.dispose = () => {
    delete state.dispose;
    disposable.dispose();
    return state.dispose();
  };

  return state;
};

export const observableMap = (reducersMap) => {
  const state = new Rx.BehaviorSubject({});
  const keys = Object.keys(reducersMap);
  const reducers = keys.map((name) => reducersMap[name]);
  const {length} = keys;

  const combine = function () {
    const state = {};
    let i = -1;

    while (++i < length) state[keys[i]] = arguments[i];

    return state;
  };

  const disposable = Rx.Observable
    .combineLatest(...reducers, combine)
    .subscribe((nextState) => {
      state.onNext(nextState)
    });

  state.dispose = () => {
    delete state.dispose;
    disposable.dispose();
    return state.dispose();
  }

  return state;
}

export const observableList = (reducersList) => {
  const state = new Rx.BehaviorSubject([]);

  const disposable = Rx.Observable
    .combineLatest(...reducersList)
    .subscribe((nextState) => {
      state.onNext(nextState);
    });

  state.dispose = () => {
    delete state.dispose;
    disposable.dispose();
    return state.dispose();
  }

  return state;
};

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
