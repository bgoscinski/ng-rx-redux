import thunkMiddleware from 'redux-thunk'; // redux compatible

import 'state/filter.js'
import 'state/form.js'
import 'state/todo.js'
import 'state/todos.js'
import 'state/todos-app.js'

import 'components/add-todo.js'
import 'components/debug-cmp.js'
import 'components/todo.js'
import 'components/todos-app.js'
import 'components/todos.js'

import {createStore, partition, share} from './lang.js';
import {constantFactory} from './core.js';

constantFactory('store', (todosApp) => {
  return createStore(todosApp, [
    thunkMiddleware
  ])
})
