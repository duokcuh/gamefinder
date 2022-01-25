import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SearchAppBar from './components/SearchAppBar';
import { GameInfo } from './components/GameInfo';
import { Container } from '@mui/material';
import { GameList } from './components/GameList';
import { Provider } from 'react-redux';
import { store } from './store/store';


function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <SearchAppBar />
        <Container>
          <Routes>
            <Route path="/" element={<GameList />} />
            <Route path="game/:id" element={<GameInfo />} />
          </Routes>
        </Container>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
