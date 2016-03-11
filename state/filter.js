import {provider} from 'core.js'
import {selfProvider} from 'lang.js'

provider('filter', (reducerProvider) => {
  const setFilter = (state, action) => action.filter;

  const stateObs = reducerProvider((state = 'SHOW_ALL', action) => {
    switch (action.type) {
      case 'setFilter': return setFilter(state, action);
    }

    return state;
  });

  return Object.assign(stateObs, selfProvider(stateObs));
})
