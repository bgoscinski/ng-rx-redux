import {provider} from 'core.js'
import {selfProvider} from 'lang.js'

provider('filterActions', (actionsProvider) => {
  const actions = Object.assign((action) => {actionsProvider.onNext(action)}, {
    all: () => ({type: 'setFilter', filter: 'SHOW_ALL'}),
    done: () => ({type: 'setFilter', filter: 'SHOW_DONE'}),
    undone: () => ({type: 'setFilter', filter: 'SHOW_UNDONE'}),
  });

  return Object.assign(actions, selfProvider(actions));
})
