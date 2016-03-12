import {provider} from 'core.js'
import {selfProvider, observableList} from 'lang.js'

provider('todos', (reducerProvider, todoProvider) => {
  let todosUUID = -1;
  let todosSubs = {};

  const addTodo = (state, action) => {
    const newTodo = todoProvider({
      id: ++todosUUID,
      msg: action.msg,
      done: action.done
    });

    todosSubs[todosUUID] = newTodo.subscribe(() => {
      stateObs.onNext(stateObs.value)
    });

    return state.concat(newTodo);
  }

  const delTodo = (state, action) => {
    const {id} = action;
    todosSubs[id].dispose();
    delete todosSubs[id];
    return state.filter((t) => t.value.id !== id);
  }

  const stateObs = reducerProvider((state = [], action) => {
    switch (action.type) {
      case 'addTodo': return addTodo(state, action);
      case 'delTodo': return delTodo(state, action);
    }

    return state
  })

  return Object.assign(stateObs, selfProvider(stateObs));
})
