import { Box, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useEffect } from 'react';
import { getGameInfo } from '../store/asyncActions';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Spinner from './Spinner';
import { LOADING } from '../store/store';

export const GameInfo = () => {
  const isLoading = useSelector(state => state.isLoading, shallowEqual);
  const isError = useSelector(state => state.isError, shallowEqual);
  const games = useSelector(state => state.games, shallowEqual);
  const { name, images, fields } = useSelector(({ gameInfo }) => gameInfo, shallowEqual);
  const dispatch = useDispatch();
  let { id } = useParams();
  
  useEffect(() => {
    dispatch(getGameInfo(id));
    return () => {
      if (!games.length) dispatch({ type: LOADING })
    }
  }, [dispatch, id]);
  
  if (isError) {
    return (
      <Typography variant="h5" component="p" my={2}>
        Something gone wrong
      </Typography>
    )
  }
  
  return (
    <>
      {isLoading ? <Spinner /> :
        <>
          <Typography variant="h4" textAlign="center" my={2}>
            {name}
          </Typography>
          <Grid container spacing={2}>
            <Grid item sm={12} md={4}>
              <Box mx="auto" sx={{width: 1, maxWidth: 400}}>
                <img
                width='100%'
                alt={`${name} cover`}
                src={`https://images.igdb.com/igdb/image/upload/t_720p/${images.cover.image_id}.jpg`}
              /></Box>
            </Grid>
            <Grid item sm={12} md={8}>
              <List disablePadding={true}>
                {
                  fields.map(field => {
                    return (
                      <ListItem key={field.label} disablePadding={true}>
                        <ListItemText>
                          <strong>{field.label}: </strong>{field.value} {field.payload}
                        </ListItemText>
                      </ListItem>
                    )
                  })
                }
              </List>
            </Grid>
          </Grid>
        </>
      }
    </>
  );
};

