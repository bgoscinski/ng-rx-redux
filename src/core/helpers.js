import {BehaviorSubject} from 'rxjs/subject/BehaviorSubject.js'

const reducerBindings = new WeakMap()

export const bindState = (state$, action$, middlewares = []) => {
  const bindingFn = reducerBindings.get(state$)

  if (bindingFn) {
    reducerBindings.delete(state$)
    bindingFn(state$, action$, middlewares)
  }
}

export const createState = (bindState, initValue) => {
  const state$ = new BehaviorSubject(initValue)
  reducerBindings.set(state$, bindState)
  return state$
}

export const decorateState = (state$, decorator) => {
  const originalBind = reducerBindings.get(state$)

  if (!originalBind) {
    throw new Error()
  }

  reducerBindings.set(state$, (state$, action$, postMiddlewares) => {
    originalBind(state$, action$, [decorator, ...postMiddlewares])
  })

  return state$
}

export const applyMiddlewares = (middlewares, base$, ...args) => {
  const apply = (base$, middleware) => middleware(base$, ...args) || base$
  return middlewares.reduce(apply, base$)
}
