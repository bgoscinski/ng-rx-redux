import {provider} from 'core.js'
import {selfProvider} from 'lang.js'

provider('todos', (reducerProvider) => {
  let todosUUID = 0;

  const addTodo = (state, action) => state.concat([{
    id: todosUUID++,
    msg: action.msg,
    done: action.done
  }])

  const delTodo = (state, action) => state.filter((t) => t.id !== action.id);

  const toggleTodo = (state, action) => state.map((t) => {
    if (t.id === action.id) {
      return { ...t, done: !t.done }
    }

    return t;
  })

  const stateObs = reducerProvider((state = [], action) => {
    switch (action.type) {
      case 'addTodo': return addTodo(state, action);
      case 'delTodo': return delTodo(state, action);
      case 'toggleTodo': return toggleTodo(state, action);
    }

    return state
  })

  return Object.assign(stateObs, selfProvider(stateObs));
})
