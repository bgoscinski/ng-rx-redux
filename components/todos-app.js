import {component} from 'core.js';

component('todosApp', {
  template: `
    <debug-cmp observe="todosApp"></debug-cmp>
    <debug-cmp observe="todos"></debug-cmp>
    <debug-cmp observe="filter"></debug-cmp>
    <add-todo></add-todo>
    <todos list="::todosApp.todos"></todos>
  `,
})
