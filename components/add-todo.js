import {component} from 'core.js';
import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject.js';

component('addTodo', {
  bindings: {
    onAdd: '&'
  },

  controller: class FormController {
    constructor() {
      this.form$ = new BehaviorSubject({});
    }

    submit() {
      this.onAdd(this.form$.value);
    }

    setMsg(msg) {
      this.setForm({
        ...this.form$.value,
        msg
      })
    }

    setForm(form) {
      this.form$.next(form);
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
