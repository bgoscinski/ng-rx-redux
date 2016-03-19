import {set} from 'lodash/fp';
import {createReducer} from 'lang.js'
import {constant} from 'core.js';

const updateField = (formData, {field, value}) => {
  return set(field, value, formData);
}

const replaceForm = (oldFormData, newformData) => newformData

constant('form', createReducer((state = {}, action) => {
  switch (action.type) {
    case 'updateField': return updateField(state, action.payload);
    case 'replaceForm': return replaceForm(state, action.payload);
  }

  return state;
}))

constant('formActions', {
  update: (field, value) => ({type: 'updateField', payload: {field, value}}),
  replace: (payload) => ({type: 'replaceForm', payload})
})
