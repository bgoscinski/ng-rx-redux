import {component} from 'core.js';

component('todosApp', {
  controllerAs: 'todosApp',
  controller: class TodosApp {
    constructor(store, todos, todosActions, filter, filterActions) {
      this.todos = todos;
      this.filter = filter;

      this.store = store;
      this.filterActions = filterActions;
      this.todosActions = todosActions;
    }

    addTodo(msg) {
      this.store.dispatch(this.todosActions.add(msg));
    }

    delTodo(id) {
      this.store.dispatch(this.todosActions.del(id));
    }

    toggleTodo(id) {
      this.store.dispatch(this.todosActions.toggle(id));
    }
  },
  template: `
    <debug-cmp observe="todosApp"></debug-cmp>
    <debug-cmp observe="todos"></debug-cmp>
    <debug-cmp observe="filter"></debug-cmp>
    <add-todo on-add="todosApp.addTodo(msg)"></add-todo>
    <todos list="::todosApp.todos"
           on-delete="todosApp.delTodo(id)"
           on-toggle="todosApp.toggleTodo(id)"
    ></todos>
  `,
})
