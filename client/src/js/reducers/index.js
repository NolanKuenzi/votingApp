import getCookie from '../controllers/getCookie';

const initialState = {
  currentComp: 'polls',
  userEmail: getCookie('email'),
};
function rootReducer(state = initialState, action) {
  if (action.type === 'CURRENT_COMPONENT') {
    return Object.assign({}, state, {
      currentComp: action.payload,
    });
  }
  if (action.type === 'USER_EMAIL') {
    return Object.assign({}, state, {
      userEmail: action.payload,
    });
  }
  return state;
}
export { initialState, rootReducer };
