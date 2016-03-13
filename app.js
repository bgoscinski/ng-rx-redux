import 'state/filter.js'
import 'state/todo.js'
import 'state/todos.js'
import 'state/todos-app.js'

import 'components/add-todo.js'
import 'components/debug-cmp.js'
import 'components/todo.js'
import 'components/todos-app.js'
import 'components/todos.js'

import {createStore} from './lang.js';
import {constantFactory} from './core.js';

const thunkMiddleware = (all$, {dispatch}) => {
  const [thunk$, action$] = all$.partition((action) => {
    return typeof action === 'function'
  })

  thunk$.forEach((thunk) => {
    thunk(dispatch)
  })

  return action$;
}

const logMiddleware = (logName) => (value$) => {
  value$.forEach((value) => console.log(logName, value));
}

constantFactory('store', (todosApp) => {
  return createStore(todosApp, [
    logMiddleware('pre: 1'),
    thunkMiddleware,
    logMiddleware('pre: 2'),
  ], [
    logMiddleware('post: 1'),
    logMiddleware('post: 2'),
  ])
})
