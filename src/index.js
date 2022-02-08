import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Typography } from '@mui/material';
import App from './App';
import { GameList } from './components/GameList';
import { GameInfo } from './components/GameInfo';

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<GameList />} />
        <Route path="search" element={<GameList />} />
        <Route path="game/:id" element={<GameInfo />} />
        <Route
          path="*"
          element={
            <Typography variant="h5" component="p" my={2}>
              There's nothing here!
            </Typography>
          }
        />
      </Route>
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);
