import {createReducer, createComposingReducer} from 'lang.js'
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

  return createComposingReducer((state = [], action) => {
    switch (action.type) {
      case 'addTodo': return addTodo(state, action);
      case 'delTodo': return delTodo(state, action);
    }

    return state
  })
})


factory('todosActions', ($timeout) => ({
  add: (msg = '', done = false) => ({type: 'addTodo', msg, done}),
  del: (id) => ({type: 'delTodo', id}),
  toggle: (id) => (dispatch) => {
    dispatch({type: 'updatingTodo', id});

    $timeout(() => { // make api request
      dispatch({type: 'updatedTodo', id});
      dispatch({type: 'toggleTodo', id});
    }, 1000)
  }
}))
