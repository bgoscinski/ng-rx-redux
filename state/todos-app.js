import {constantFactory} from 'core.js'
import {composeReducers} from 'lang.js'

constantFactory('todosApp', (form, todos, filter) => composeReducers({
  form,
  todos,
  filter
}))
