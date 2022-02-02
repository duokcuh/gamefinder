import axios from 'axios';
import { ERROR, GET_GAME_INFO, GET_GAMES } from './store';
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
    
    return ({ type: GET_GAMES, payload: games })
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


//format fetchGamesInfo result
const formatResult = result => {
  
  if (result.collection) {
    result.collection = [...result.collection.games]
  }
  
  //developer only
  if (result.involved_companies) {
    let developer = result.involved_companies.sort((a, b) => a.company.id - b.company.id)
      .find(item => item.developer === true);
    result.involved_companies = developer && developer.company.name;
  }
  
  console.log('result: ', result);
  const fields = [];
  const fieldsBase = [
    { field: 'genres', label: 'Genre' },
    { field: 'game_modes', label: 'Game mode' },
    { field: 'player_perspectives', label: 'Player perspective' },
    { field: 'themes', label: 'Theme' },
    { field: 'multiplayer_modes', label: 'Multiplayer' },
    { field: 'involved_companies', label: 'Developer' },
    { field: 'first_release_date', label: 'Release date' },
    { field: 'platforms', label: 'Platform' },
    { field: 'rating', label: 'Local rating' },
    { field: 'aggregated_rating', label: 'External critic rating' },
    { field: 'age_ratings', label: 'Age rating (PEGI)' },
    { field: 'storyline', label: 'Storyline' },
    { field: 'summary', label: 'Summary' },
    { field: 'collection', label: 'Game collection' },
    { field: 'dlcs', label: 'DLC' },
    { field: 'expansions', label: 'Expansions' },
    { field: 'similar_games', label: 'Similar games' }
  ];
  fieldsBase.forEach(item => {
    const { field } = item;
    if (!result[field]) return;
    try {
      //PEGI age rating
      if (field === 'age_ratings') {
        let { synopsis, rating } = result[field].find(item => item.category === 2) || {};
        if (rating === 1) rating = '3+';
        else if (rating === 2) rating = '7+';
        else if (rating === 3) rating = '12+';
        else if (rating === 4) rating = '16+';
        else if (rating === 5) rating = '18+';
        else rating = 'Unknown';
        item.value = rating;
        item.payload = synopsis;
      }
      //supported multiplayer modes for different platforms
      else if (field === 'multiplayer_modes') {
        let modesPC = [];
        let nonPC = new Set();
        result[field].forEach(item => {
          for (let mode in item) {
            if (item[mode] === true)
              item.platform.name === 'PC (Microsoft Windows)' ? modesPC.push(mode) : nonPC.add(mode);
          }
        });
        if (modesPC.length) item.value = `PC: ${modesPC.join(', ')}`;
        if (nonPC.size) item.payload = `Non PC: ${[...nonPC].join(', ')}`;
      }
      //external and local ratings with number of scores
      else if (field === 'aggregated_rating' || field === 'rating') {
        item.value = Math.round(result[field]);
        item.payload = `(scores: ${result[field + '_count']})`;
      }
      //release date from unix timestamp
      else if (field === 'first_release_date') {
        item.value = moment.unix(result[field]).format('DD.MM.YYYY');
      }
      //for result fields like [{name: ... }, ...]
      else if (Array.isArray(result[field])) {
        item.value = result[field].map(item => item.name).join(', ');
      } else {
        item.value = result[field]
      }
      fields.push(item);
    } catch (err) {
      console.warn(`Unexpected behavior in the ${field}: `, err);
      console.log(`${field}: `, result[field]);
    }
  });
  
  const { name, artworks, cover, screenshots } = result;
  
  //all images
  const images = { artworks, cover, screenshots };
  
  return { name, images, fields }
}


const makeRequest = (fetchFunc, query, retry = true) => async (dispatch) => {
  
  try {
    const token = await getToken(proxy);
    const action = await fetchFunc(token, query);
    dispatch(action);
  } catch (err) {
    if (!err.response) console.log(err);
    else if (err.response.status === 401) {
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