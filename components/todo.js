import {component} from 'core.js';
import {bindActionCreators} from 'lang.js';

component('todo', {
  bindings: {
    data$: '<data',
  },

  controllerAs: 'todo',
  controller: class TodoController {
    constructor(todoActions, store) {
      this.actions = bindActionCreators(todoActions, store.dispatch);
    }

    get id() {
      return this.data$.value.id;
    }

    update(newValues) {
      return this.actions.update(this.id, newValues);
    }

    toggle() {
      return this.actions.toggle(this.id);
    }

    delete() {
      return this.actions.delete(this.id);
    }
  },

  template: `
    <div style="overflow: auto; width: 400px">
      <debug-cmp observable="todo.data$" observe="todo"></debug-cmp>

      <input type="text" rx-model="::todo.data$ as todo : todo.msg" on-next="todo.update({msg: value})">

      <div rx-bind="::todo.data$ as todo : todo.done ? 'done' : 'unndone'"></div>
      <button ng-click="todo.delete()">Delete</button>
      <button ng-click="todo.toggle()">Toggle</button>
    </div>
  `
})
