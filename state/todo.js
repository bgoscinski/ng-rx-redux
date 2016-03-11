import {provider} from 'core.js'
import {selfProvider} from 'lang.js'

provider('todo', (reducerProvider) => {
  const factory = (initState) => {
    const toggleTodo = (state, action) => ({...state, done: !state.done})
    const delTodo = (state, action) => { stateObs.dispose(); return state; }

    const stateObs = reducerProvider((state = initState, action) => {
      if (state.id === action.id) switch (action.type) {
        case 'toggleTodo': return toggleTodo(state, action);
        case 'delTodo': return delTodo(state, action);
      }

      return state;
    });

    return stateObs;
  }

  return Object.assign(factory, selfProvider(factory));
})
