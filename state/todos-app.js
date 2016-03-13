import {constantFactory} from 'core.js'
import {composeReducers} from 'lang.js'

constantFactory('todosApp', (todos, filter) => composeReducers({
  todos,
  filter
}))
