import {component} from 'core.js';

component('addTodo', {
  bindings: {
    onAdd: '&'
  },

  template: `
    <form ng-submit="$ctrl.onAdd({msg: $ctrl.msg})">
      <input type="text" ng-model="$ctrl.msg" />
    </form>
  `
})
