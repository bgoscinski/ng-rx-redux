import {component} from 'core.js';
import {bindActionCreators} from 'lang.js';

component('addTodo', {
  controllerAs: 'addTodo',
  controller: class AddTodoController {
    constructor(form, todosActions, formActions, store) {
      this.form$ = form;
      this.addTodo = bindActionCreators(todosActions.add, store.dispatch);
      Object.assign(this, bindActionCreators(formActions, store.dispatch));
    }

    submit() {
      const {msg, done} = this.form$.value;
      this.addTodo(msg, done);
    }
  },

  template: `
    <form ng-submit="addTodo.submit()">
      <label for="msg">Message:</label>
      <input type="text" name="msg"
        rx-model="addTodo.form$ as form : form.msg"
        on-next="addTodo.update({msg: value})"
      ><br>

      <label for="done">Done:</label>
      <input type="checkbox" name="done"
        rx-model="addTodo.form$ as form : form.done"
        on-next-form="addTodo.update(value)"
      >
    </form>
    <debug-cmp observe="form" observable="addTodo.form$"></debug-cmp>
  `
})
