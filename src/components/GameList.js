import { Grid, Pagination, Skeleton, Stack, Typography } from '@mui/material';
import { getGames } from '../store/asyncActions';
import { useEffect, useState } from 'react';
import { GameItem } from './GameItem';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

export const GameList = () => {
  const [page, setPage] = useState(1);
  let isLoading = useSelector(state => state.isLoading, shallowEqual);
  let games = useSelector(state => state.games, shallowEqual);
  let isError = useSelector(state => state.isError, shallowEqual);
  let query = useSelector(state => state.query, shallowEqual);
  const dispatch = useDispatch();
  
  const pageChange = (event, value) => setPage(value);
  
  useEffect(() => {
    dispatch(getGames(query))
  }, [dispatch, query]);
  
  if (isError) {
    return (
      <Typography variant="h5" component="p" my={2}>
        Something gone wrong
      </Typography>
    )
  }
  
  return (
    <>
      <Typography variant="h4" textAlign="center" my={2}>
        {isLoading ? <Skeleton /> :
          query ? `Search results for "${query}" (total ${games.length})` : 'Top rated games'}
      </Typography>
      {
        !isLoading && games.length === 0
          ?
          <Typography variant="h5" component="div">
            Unfortunately no results. Please change request and try again.
          </Typography>
          :
          <Stack spacing={2} alignItems="center">
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {(isLoading
                ? Array.from(new Array(4))
                : games.slice((page - 1) * 12, page * 12)).map((item, index) => (
                <Grid item xs={6} sm={4} md={3} key={item?.id || index}>
                  <GameItem {...item} isLoading={isLoading} />
                </Grid>
              ))}
            </Grid>
            {
              games.length > 12 &&
              <Pagination
                count={Math.ceil(games.length / 12)}
                color="primary"
                page={page}
                onChange={pageChange}
              />
            }
          </Stack>
      }
    </>
  );
};