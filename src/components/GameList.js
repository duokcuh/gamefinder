import { Grid, Typography } from '@mui/material';
import { getGames } from '../store';
import { useEffect } from 'react';
import { GameItem } from './GameItem';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';


export const GameList = () => {
  // let { isLoading, games } = useSelector(({ isLoading, games }) => ({ isLoading, games }), shallowEqual);
  let isLoading = useSelector(state => state.isLoading, shallowEqual);
  let games = useSelector(state => state.games, shallowEqual);
  let isError = useSelector(state => state.isError, shallowEqual);
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getGames());
  }, [dispatch]);
  
  if (isError) {
    return (
      <p>Something wrong</p>
    )
  }
  
  if (isLoading) {
    games = [{id:0}, {id:1}, {id:2}]
  }
  
  return (
    <>
      <Typography variant="h4" textAlign="center" my={2}>
        Top 10 games or Search result
      </Typography>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {games.map((item, id) => (
          <Grid item xs={6} sm={4} md={3} key={item.id}>
            <GameItem {...item} isLoading={isLoading} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

