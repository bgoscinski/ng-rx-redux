import {provider} from 'core.js'
import {selfProvider, observableList} from 'lang.js'

provider('todos', (reducerProvider, todoProvider) => {
  let todosUUID = 0;

  const addTodo = (state, action) => {
    const newTodo = todoProvider({
      id: todosUUID++,
      msg: action.msg,
      done: action.done
    });

    const newState = observableList(state.value.concat(newTodo));
    state.dispose();
    return newState;
  }

  const delTodo = (state, action) => state.filter((t) => t.value.id !== action.id);

  const stateObs = reducerProvider((state = observableList([]), action) => {
    switch (action.type) {
      case 'addTodo': return addTodo(state, action);
      case 'delTodo': return delTodo(state, action);
    }

    return state
  })

  return Object.assign(stateObs, selfProvider(stateObs));
})
