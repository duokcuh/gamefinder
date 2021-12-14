import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { applyMiddleware } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import axios from 'axios';

const proxy = 'https://cors-access-allow.herokuapp.com/';

const getToken = async () => {
  let nowTime = Math.ceil(Date.now() / 1000);
  let tokenObj = JSON.parse(localStorage.getItem('tokenObj'));
  if (tokenObj?.expiresTime > nowTime) return tokenObj.token;
  
  let expiresTime = Math.floor(Date.now() / 1000);
  try {
    const response = await axios({
      url: proxy + 'https://id.twitch.tv/oauth2/token',
      method: 'POST',
      params: {
        client_id: process.env.REACT_APP_CLIENT_ID,
        client_secret: process.env.REACT_APP_CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    });
    let token = response.data.access_token;
    expiresTime = expiresTime + response.data.expires_in;
    localStorage.setItem('tokenObj', JSON.stringify({ token, expiresTime }));
    return token
  }
  catch (err) {
    err.response.status = 'tokenError';
    throw err
  }
}

export const getGames = (query, retry = true) => async (dispatch) => {
  dispatch({ type: LOADING });
  
  try {
    const access_token = await getToken();
    let data = '';
    if (query) {
      data = `search "${query}"; limit 500;`
    } else {
      data =
        'sort total_rating desc;' +
        'where total_rating_count>500 & genres=(12) & platforms=(6,48) & release_dates.y>2010;'
    }
    const result = await axios({
      url: proxy + 'https://api.igdb.com/v4/games',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Client-ID': process.env.REACT_APP_CLIENT_ID,
        Authorization: `Bearer ${access_token}`
      },
      data: 'fields cover.image_id,name; where cover.image_id!=null & category=0;' + data
    });
    
    const games = result.data.map(({ id, cover, name }) => ({
        id,
        name,
        image: `https://images.igdb.com/igdb/image/upload/t_cover_big/${cover.image_id}.jpg`
      })
    );
    dispatch({ type: GET_GAMES, payload: { games, query } });
  }
  catch (err) {
    // console.log(err.response);
    if (err.response.status === 401) {
      localStorage.removeItem('tokenObj');
      if (retry) dispatch(getGames(query, false));
      else console.log('getGames request authorization error: ', err.response.data);
    } else if (err.response.status === 400) {
      console.log('getGames request data error: ', err.response.data[0].title);
    } else if (err.response.status === 'tokenError') {
      console.log('getToken error: ', err.response.data.message);
    } else console.log('Unexpected error:', err);
    dispatch({ type: ERROR });
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
  game: {},
  query: ''
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_GAMES:
      const { games, query } = action.payload;
      return {
        ...state,
        isLoading: false,
        games,
        query
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