import {createReducer} from 'lang.js'
import {constant} from 'core.js';

const updateForm = (oldFormData, newformData) => newformData

constant('form', createReducer((state = {}, action) => {
  switch (action.type) {
    case 'updateForm': return updateForm(state, action.payload);
  }

  return state;
}))

constant('formActions', {
  update: (payload) => ({type: 'updateForm', payload})
})
