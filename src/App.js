import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material';
import SearchAppBar from './components/SearchAppBar';
import { store } from './store/store';
import { Provider } from 'react-redux';


function App() {
  return (
    <Provider store={store}>
      <SearchAppBar />
      <Container>
        <Outlet />
      </Container>
    </Provider>
  );
}

export default App;
