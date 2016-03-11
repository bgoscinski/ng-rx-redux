import {component} from 'core.js';

component('todosApp', {
  controllerAs: 'app',
  controller: class {
    constructor(todos, todosActions, filter, filterActions) {
      this.todos = todos;
      this.filter = filter;

      this.filterActions = filterActions;
      this.todosActions = todosActions;
    }

    addTodo(msg) {
      this.todosActions(this.todosActions.add(msg));
    }

    delTodo(id) {
      this.todosActions(this.todosActions.del(id));
    }

    toggleTodo(id) {
      this.todosActions(this.todosActions.toggle(id));
    }
  },
  template: `
    <debug-cmp observe="appState"></debug-cmp>
    <debug-cmp observe="todos"></debug-cmp>
    <debug-cmp observe="filter"></debug-cmp>
    <add-todo on-add="app.addTodo(msg)"></add-todo>
    <todos list="::app.todos"
           on-delete="app.delTodo(id)"
           on-toggle="app.toggleTodo(id)"
    ></todos>
  `,
})
