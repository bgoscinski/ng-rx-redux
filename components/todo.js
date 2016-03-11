import {component} from 'core.js';

component('todo', {
  bindings: {
    'data': '<',
    'onDelete': '&',
    'onToggle': '&'
  },

  template: `
    <p>{{::$ctrl.data.msg}}</p>
    <div>{{$ctrl.data.done ? 'done' : 'undone'}}</div>
    <button ng-click="$ctrl.onDelete({id: $ctrl.data.id})">Delete</button>
    <button ng-click="$ctrl.onToggle({id: $ctrl.data.id})">Toggle</button>
  `
})
