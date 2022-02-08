import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { applyMiddleware } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';

export const LOADING       = 'LOADING',
             GET_GAMES     = 'GET_GAMES',
             GET_GAME_INFO = 'GET_GAME_INFO',
             ERROR         = 'ERROR';

const initialState = {
  isLoading: true,
  isError: false,
  games: [],
  gameInfo: {},
}

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case GET_GAMES:
      return {
        ...state,
        isLoading: false,
        games: payload
      };
    case GET_GAME_INFO:
      return {
        ...state,
        isLoading: false,
        gameInfo: payload
      };
    case LOADING:
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case ERROR:
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      return state;
  }
}

export const store = createStore(reducer, undefined, composeWithDevTools(applyMiddleware(thunk)));