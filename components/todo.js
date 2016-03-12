import {component} from 'core.js';

component('todo', {
  bindings: {
    'todo': '<data',
    'onDelete': '&',
    'onToggle': '&'
  },

  template: `
    <debug-cmp observable="$ctrl.todo" observe="todo"></debug-cmp>
    <p rx-bind="::$ctrl.todo as todo : todo.msg"></p>
    <div rx-bind="::$ctrl.todo as todo : todo.done ? 'done' : 'unndone'"></div>
    <button ng-click="$ctrl.onDelete({id: $ctrl.todo.value.id})">Delete</button>
    <button ng-click="$ctrl.onToggle({id: $ctrl.todo.value.id})">Toggle</button>
  `
})
