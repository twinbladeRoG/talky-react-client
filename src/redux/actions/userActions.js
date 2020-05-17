/* eslint-disable import/prefer-default-export */
import { USER } from '../types';

export const login = (name) => (dispatch) =>
  dispatch({
    type: USER.LOGIN,
    payload: name
  });

export const socketConnected = (id, socketId) => (dispatch) =>
  dispatch({
    type: USER.SOCKET_CONNECTED,
    payload: {
      id,
      socketId
    }
  });
