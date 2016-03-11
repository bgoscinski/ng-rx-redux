import {provider} from 'core.js'
import {selfProvider, observableMap} from 'lang.js'

provider('appState', (todosProvider, filterProvider) => {
  const stateObs = observableMap({
    todos: todosProvider,
    filter: filterProvider,
  });

  return Object.assign(stateObs, selfProvider(stateObs));
})
