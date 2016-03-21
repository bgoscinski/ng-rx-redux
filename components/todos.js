import {component} from 'core.js';

component('todos', {
  bindings: {
    list: '<',
    onDelete: '&',
    onToggle: '&'
  },
  template: `
    <div rx-if="::$ctrl.list as todos : todos.length === 0">Add todo :)</div>
    <div rx-if="::$ctrl.list as todos : todos.length > 0">
      <todo rx-repeat="::$ctrl.list as todos : todo in todos track by todo.value.id"
            data="::todo"
            on-delete="$ctrl.onDelete({id: id})"
            on-toggle="$ctrl.onToggle({id: id})"
      ></todo>
    </div>
  `
})
