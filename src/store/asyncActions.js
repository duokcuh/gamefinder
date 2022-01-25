import axios from 'axios';
import { ERROR, GET_GAME_INFO, GET_GAMES, LOADING } from './store';
import { getToken } from './getToken';
import moment from 'moment';

const proxy = 'https://cors-access-allow.herokuapp.com/';

const fetchGames = async (token, query) => {
  let data = '';
  if (query) {
    data = `search "${query}"; limit 500;`
  } else {
    data =
      'sort total_rating desc;' +
      'where total_rating_count>500 & genres=(12) & platforms=(6,48) & first_release_date>1262304000; limit 12;'
  }
  
  try {
    const result = await axios({
      url: proxy + 'https://api.igdb.com/v4/games',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Client-ID': process.env.REACT_APP_CLIENT_ID,
        Authorization: `Bearer ${token}`
      },
      data: 'fields cover.image_id,name; where cover.image_id!=null & category=0;' + data
    });
    
    const games = result.data.map(({ id, cover, name }) => ({
        id,
        name,
        image: `https://images.igdb.com/igdb/image/upload/t_cover_big/${cover.image_id}.jpg`
      })
    );
    
    return ({ type: GET_GAMES, payload: { games, query } })
  } catch (err) { throw err }
}

const fetchGameInfo = async (token, query) => {
  try {
    const result = await axios({
      url: proxy + 'https://api.igdb.com/v4/games',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Client-ID': process.env.REACT_APP_CLIENT_ID,
        Authorization: `Bearer ${token}`
      },
      data:
        `fields age_ratings.*,aggregated_rating,aggregated_rating_count,artworks.image_id,collection.games.name,cover.image_id,dlcs.name,expansions.name,first_release_date,game_modes.name,genres.name,involved_companies.*,involved_companies.company.name,multiplayer_modes.*,multiplayer_modes.platform.*,name,platforms.name,player_perspectives.name,rating,rating_count,screenshots.image_id,similar_games.name,storyline,summary,themes.name; where id=${query};`
    });
    
    const gameInfo = formatResult(result.data[0]);
    return ({ type: GET_GAME_INFO, payload: gameInfo });
  } catch (err) { throw err }
}

//getGamesInfo result handler
const formatResult = result => {
  console.log('result start: ', { ...result });
  
  const { name, artworks, cover, screenshots } = result;
  
  //all images
  const images = { artworks, cover, screenshots };
  
  //PEGI age rating
  if (result.age_ratings) {
    let { synopsis, rating } = result.age_ratings.find(item => item.category === 2) || {};
    if (rating === 1) rating = '3+';
    else if (rating === 2) rating = '7+';
    else if (rating === 3) rating = '12+';
    else if (rating === 4) rating = '16+';
    else if (rating === 5) rating = '18+';
    else rating = 'Unknown format';
    result.age_ratings = { synopsis, rating }
  }
  
  if (result.collection) {
    result.collection = [...result.collection.games]
  }
  
  //developer only
  if (result.involved_companies) {
    let { company } = result.involved_companies.sort((a, b) => a.company.id - b.company.id)
      .find(item => item.developer === true);
    result.involved_companies = [company];
  }
  
  //supported multiplayer modes for different platforms
  if (result.multiplayer_modes) {
    let multiplayer_modes = {};
    result.multiplayer_modes.forEach(item => {
      let modes = [];
      for (let key in item) {
        if (item[key] === true) modes.push(key)
      }
      modes && (multiplayer_modes = { ...multiplayer_modes, [item.platform.name]: modes })
    });
    result.multiplayer_modes = multiplayer_modes;
  }
  
  console.log('result end: ', result);
  
  const fields = [];
  [
    { age_ratings: 'Age rating (PEGI)' },
    { aggregated_rating: 'External rating' },
    { collection: 'Game collection' },
    { dlcs: 'DLC' },
    { expansions: 'Expansions' },
    { first_release_date: 'Release date' },
    { game_modes: 'Game modes' },
    { genres: 'Genres' },
    { involved_companies: 'Developer' },
    { multiplayer_modes: 'Multiplayer' },
    { platforms: 'Platforms' },
    { player_perspectives: 'Player perspective' },
    { rating: 'Local rating' },
    { similar_games: 'Similar games' },
    { storyline: 'Storyline' },
    { summary: 'Summary' },
    { themes: 'Theme' }
  ].forEach(label => {
    let key = Object.keys(label)[0];
    if (result[key]) {
      let data = { label: label[key] };
      if (Array.isArray(result[key])) {
        data.value = result[key].map(item => item.name).join(', ');
      } else if (key === 'age_ratings') {
        data.value = result[key].rating;
        data.payload = result[key].synopsis;
      } else if (key === 'aggregated_rating' || key === 'rating') {
        data.value = Math.round(result[key]);
        data.payload = result[key + '_count'];
      } else if (key === 'first_release_date') {
        data.value = moment.unix(result[key]).format('DD.MM.YYYY');
      } else if (key === 'multiplayer_modes') {
        for (let platform in result[key]) {
          if (platform === 'PC (Microsoft Windows)') data.value = `PC: ${result[key][platform]}`;
          else data.payload = `Non PC: ${data.payload} + ${result[key][platform]}`;
        }
      } else {
        data.value = result[key]
      }
      fields.push(data)
    }
  });
  console.log(fields);
  return { name, images, fields }
}

const makeRequest = (fetchFunc, query, retry = true) => async (dispatch) => {
  dispatch({ type: LOADING });
  
  try {
    const token = await getToken(proxy);
    const action = await fetchFunc(token, query);
    dispatch(action);
  } catch (err) {
    // console.log(err.response);
    if (err.response.status === 401) {
      localStorage.removeItem('tokenObj');
      if (retry) dispatch(makeRequest(fetchFunc, query, false));
      else console.log('getGames request authorization error: ', err.response.data);
    } else if (err.response.status === 400) {
      console.log('getGames request data error: ', err.response.data[0].title);
    } else if (err.response.status === 'tokenError') {
      console.log('getToken error: ', err.response.data.message);
    } else console.log('Unexpected error:', err);
    dispatch({ type: ERROR });
  }
}

export const getGames = query => makeRequest(fetchGames, query);
export const getGameInfo = id => makeRequest(fetchGameInfo, id);