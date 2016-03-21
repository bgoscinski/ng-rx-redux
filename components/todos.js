import {component} from 'core.js';

component('todos', {
  controllerAs: 'todos',
  controller: class TodosController {
    constructor(todos) {
      this.list = todos;
    }
  },
  template: `
    <div rx-if="::todos.list as todos : todos.length === 0">Add todo :)</div>
    <div rx-if="::todos.list as todos : todos.length > 0">
      <todo rx-repeat="::todos.list as todos : todo in todos track by todo.value.id" data="::todo"></todo>
    </div>
  `
})
