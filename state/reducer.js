import {provider} from 'core.js'
import {selfProvider, observableState} from 'lang.js'

provider('reducer', (actionsProvider) => {
  const stateCreator = observableState(actionsProvider);
  return Object.assign(stateCreator, selfProvider(stateCreator));
})
