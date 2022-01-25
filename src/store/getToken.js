import axios from 'axios';

export const getToken = async (proxy) => {
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
  } catch (err) {
    err.response.status = 'tokenError';
    throw err
  }
}