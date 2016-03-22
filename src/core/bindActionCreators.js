import {flowRight, functions} from 'lodash'

export const bindActionCreators = (actionCreators, dispatch) => {
  if (typeof actionCreators === 'function') {
    return flowRight(dispatch, actionCreators)
  }

  const boundActionCreators = {}
  const actionCreatorNames = functions(actionCreators)

  for (let i = 0, len = actionCreatorNames.length; i < len; i++) {
    const creatorName = actionCreatorNames[i]
    const boundCreator = flowRight(dispatch, actionCreators[creatorName])
    boundActionCreators[creatorName] = boundCreator
  }

  return boundActionCreators
}
