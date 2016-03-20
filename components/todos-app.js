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

    addTodo(msg, done) {
      this.store.dispatch(this.todosActions.add(msg, done));
    }

    delTodo(id) {
      this.store.dispatch(this.todosActions.del(id));
    }

    toggleTodo(id) {
      this.store.dispatch(this.todosActions.toggle(id))
        .subscribe((msg) => {
          console.log('got return value from dispatch', msg)

        })
    }
  },
  template: `
    <debug-cmp observe="todosApp"></debug-cmp>
    <debug-cmp observe="todos"></debug-cmp>
    <debug-cmp observe="filter"></debug-cmp>
    <add-todo on-add="todosApp.addTodo(msg, done)"></add-todo>
    <todos list="::todosApp.todos"
           on-delete="todosApp.delTodo(id)"
           on-toggle="todosApp.toggleTodo(id)"
    ></todos>
  `,
})
