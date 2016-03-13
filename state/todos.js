import {createReducer, createComposingReducer} from 'lang.js'
import {factory, constantFactory} from 'core.js'

// constantFactory('todos', (todo) => {
//   let todosUUID = -1;
//   let todosSubs = {};

//   const addTodo = (state, action) => {
//     const newTodo = todo({
//       id: ++todosUUID,
//       msg: action.msg,
//       done: action.done
//     });

//     todosSubs[todosUUID] = newTodo.subscribe(() => {
//       stateObs.onNext(stateObs.value)
//     });

//     return state.concat(newTodo);
//   }

//   const delTodo = (state, action) => {
//     const {id} = action;
//     todosSubs[id].dispose();
//     delete todosSubs[id];
//     return state.filter((t) => t.value.id !== id);
//   }

//   const stateObs = createReducer((state = [], action) => {
//     switch (action.type) {
//       case 'addTodo': return addTodo(state, action);
//       case 'delTodo': return delTodo(state, action);
//     }

//     return state
//   })

//   return stateObs
// })


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
