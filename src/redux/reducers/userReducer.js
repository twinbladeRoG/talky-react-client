import { USER } from '../types';

const initialState = {
  id: null,
  name: '',
  socketId: ''
};

const userReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case USER.LOGIN:
      return { ...state, name: payload };
    case USER.LOGOUT:
      return { ...initialState };
    case USER.SOCKET_CONNECTED:
      return { ...state, id: payload.id, socketId: payload.socketId };
    default:
      return state;
  }
};

export default userReducer;
