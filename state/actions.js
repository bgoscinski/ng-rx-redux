import {provider} from 'core.js';
import {selfProvider, Rx} from 'lang.js';

provider('actions', () => {
  const actionsObs = new Rx.Subject();
  return Object.assign(actionsObs, selfProvider(actionsObs));
})
