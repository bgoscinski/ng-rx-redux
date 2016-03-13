import {createReducer} from 'lang.js'
import {constant} from 'core.js'

constant('todo', (initState) => {
  const delTodo = (state, action) => { stateObs.dispose(); return null; }

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
      case 'toggleTodo': return toggleTodo(state, action);
      case 'updatingTodo': return updatingTodo(state, action);
      case 'updatedTodo': return updatedTodo(state, action);
      case 'delTodo': return delTodo(state, action);
    }

    return state;
  });

  return stateObs;
})
