import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { applyMiddleware } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';

export const LOADING       = 'LOADING',
             GET_GAMES     = 'GET_GAMES',
             GET_GAME_INFO = 'GET_GAME_INFO',
             SET_QUERY     = 'SET_QUERY',
             ERROR         = 'ERROR';

const initialState = {
  isLoading: true,
  isError: false,
  games: [],
  gameInfo: {},
  query: ''
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
    case SET_QUERY:
      return {
        ...state,
        isLoading: true,
        query: payload
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