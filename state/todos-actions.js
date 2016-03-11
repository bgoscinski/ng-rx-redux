import {provider} from 'core.js'
import {selfProvider} from 'lang.js'

provider('todosActions', (actionsProvider) => {
  const actions = Object.assign((action) => {actionsProvider.onNext(action)}, {
    add: (msg = '', done = false) => ({type: 'addTodo', msg, done}),
    del: (id) => ({type: 'delTodo', id}),
    toggle: (id) => ({type: 'toggleTodo', id})
  });

  return Object.assign(actions, selfProvider(actions));
})
