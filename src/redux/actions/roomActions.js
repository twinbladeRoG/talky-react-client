/* eslint-disable import/prefer-default-export */
import { ROOM } from '../types';

export const createRoom = (name) => (dispatch) =>
  dispatch({
    type: ROOM.CREATE_ROOM,
    payload: name
  });

export const joinRoom = (id) => (dispatch) =>
  dispatch({
    type: ROOM.CREATE_ROOM,
    payload: id
  });
