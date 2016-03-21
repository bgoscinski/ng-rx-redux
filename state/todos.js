import {createCombiningReducer} from 'lang.js'
import {factory, constantFactory} from 'core.js'

constantFactory('todos', (todo) => {
  let todosUUID = -1;

  const addTodo = (state, {msg, done}) => {
    return state.concat(todo({
      msg,
      done,
      id: ++todosUUID,
    }));
  }

  const delTodo = (state, {id}) => {
    return state.filter((t) => t.value.id !== id);
  }

  return createCombiningReducer((state = [], action) => {
    switch (action.type) {
      case 'addTodo': return addTodo(state, action);
      case 'delTodo': return delTodo(state, action);
    }

    return state
  })
})


factory('todosActions', ($timeout) => ({
  add: (msg = '', done = false) => ({type: 'addTodo', msg, done}),
}))
