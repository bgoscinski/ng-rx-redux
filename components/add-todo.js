import {component} from 'core.js';
import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject.js';

component('addTodo', {
  bindings: {
    onAdd: '&'
  },

  controller: class FormController {
    constructor(form, formActions, store) {
      this.form$ = form;
      this.formActions = formActions;
      this.store = store;
    }

    submit() {
      this.onAdd(this.form$.value);
    }

    setMsg(msg) {
      this.store.dispatch(this.formActions.update('msg', msg));
    }

    setForm(form) {
      this.store.dispatch(this.formActions.replace(form));
    }
  },

  template: `
    <form ng-submit="$ctrl.submit()">
      <label for="msg">Message:</label>
      <input type="text" name="msg"
        rx-model="$ctrl.form$ as form : form.msg"
        on-next="$ctrl.setMsg(value)"
      ><br>

      <label for="done">Done:</label>
      <input type="checkbox" name="done"
        rx-model="$ctrl.form$ as form : form.done"
        on-next-form="$ctrl.setForm(value)"
      >
    </form>
    <debug-cmp observe="form" observable="$ctrl.form$"></debug-cmp>
  `
})
