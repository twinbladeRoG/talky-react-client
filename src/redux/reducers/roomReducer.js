import { ROOM } from '../types';

const initialState = {
  id: null,
  name: '',
  socketId: ''
};

const roomReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case ROOM.CREATE_ROOM:
      return { ...state, name: payload };
    default:
      return state;
  }
};

export default roomReducer;
