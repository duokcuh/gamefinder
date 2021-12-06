import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { applyMiddleware } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import axios from 'axios';

const proxy = 'https://cors-access-allow.herokuapp.com/';

const getToken = async () => {
  let nowTime = Math.ceil(Date.now() / 1000);
  let expiresTime = localStorage.getItem('expiresTime');
  if (expiresTime > nowTime) return localStorage.getItem('token');
  expiresTime = Math.floor(Date.now() / 1000);
  const url = 'https://id.twitch.tv/oauth2/token';
  const response = await axios({
    url: proxy + url,
    method: 'POST',
    params: {
      client_id: process.env.REACT_APP_CLIENT_ID,
      client_secret: process.env.REACT_APP_CLIENT_SECRET,
      grant_type: 'client_credentials'
    }
  });
  console.log('new authorization', response.data);
  let token = response.data.access_token;
  expiresTime = expiresTime + response.data.expires_in;
  localStorage.setItem('token', token);
  localStorage.setItem('expiresTime', expiresTime);
  return token
}

export const getGames = query => async (dispatch) => {
  dispatch({ type: LOADING });
  const baseURL = proxy + 'https://api.igdb.com/v4';
  const access_token = await getToken();
  let url = '';
  if (query) {
    url = '/search'
  } else {
    url = '/games'
  }
  try {
    const games = await axios({
      url,
      baseURL,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Client-ID': process.env.REACT_APP_CLIENT_ID,
        Authorization: `Bearer ${access_token}`
      },
      data:
        'fields cover.image_id,name;' +
        'sort total_rating desc;' +
        'where total_rating_count>500 & category=0 & genres=(12) & platforms=(6,48) & release_dates.y>2010;'
    });
    let payload = games.data.map(({ id, cover, name }) => ({
      id,
      name,
      image: `https://images.igdb.com/igdb/image/upload/t_cover_big/${cover.image_id}.jpg`
    }));
    dispatch({ type: GET_GAMES, payload });
  } catch (err) {
    console.log('getGames request error: ', err);
    dispatch({ type: ERROR, payload: err.message });
  }
}

//constants
const LOADING   = 'LOADING',
      GET_GAMES = 'GET_GAMES',
      ERROR     = 'ERROR';

const initialState = {
  isLoading: true,
  isError: false,
  games: [],
  game: {}
}

const reducer = (state = initialState, action) => {
  console.log(state);
  switch (action.type) {
    case GET_GAMES:
      return {
        ...state,
        isLoading: false,
        games: action.payload
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