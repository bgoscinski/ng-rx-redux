import {constantFactory} from 'core.js'
import {combineReducers} from 'lang.js'

constantFactory('todosApp', (form, todos, filter) => combineReducers({
  form,
  todos,
  filter
}))
