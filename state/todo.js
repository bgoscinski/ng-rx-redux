import {createReducer, FromObservable} from 'lang.js'
import {constant, factory} from 'core.js'

constant('todo', (initState) => {
  const delTodo = (state, action) => { stateObs.dispose(); return null; }

  const updateTodo = (state, newValues) => ({
    ...state,
    ...newValues
  })

  const toggleTodo = (state, action) => ({
    ...state,
    done: !state.done
  })

  const updatingTodo = (state, action) => ({
    ...state,
    loading: true,
  })

  const updatedTodo = (state, action) => ({
    ...state,
    loading: false
  })

  const stateObs = createReducer((state = initState, action) => {
    if (state.id === action.id) switch (action.type) {
      case 'toggleTodo': return toggleTodo(state, action.payload);
      case 'updatingTodo': return updatingTodo(state, action.payload);
      case 'updateTodo': return updateTodo(state, action.payload);
      case 'updatedTodo': return updatedTodo(state, action.payload);
      case 'delTodo': return delTodo(state, action.payload);
    }

    return state;
  });

  return stateObs;
})

factory('todoActions', ($timeout) => ({
  delete: (id) => ({type: 'delTodo', id}),
  update: (id, payload) => (dispatch) => {
    dispatch({type: 'updatingTodo', id});
    dispatch({type: 'updateTodo', id, payload})
    dispatch({type: 'updatedTodo', id});
  },
  toggle: (id) => (dispatch) => {
    dispatch({type: 'updatingTodo', id});

    return FromObservable.create($timeout(() => { // make api request
      dispatch({type: 'updatedTodo', id});
      dispatch({type: 'toggleTodo', id});

      return 'yay!';
    }, 1000))
  }
}))
