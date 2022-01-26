import { Card, CardActionArea, CardContent, CardMedia, Typography, Skeleton } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { LOADING } from '../store/store';

export const GameItem = ({ name, image, isLoading = true, id }) => {
  const dispatch = useDispatch();
  let navigate = useNavigate();
  let imgRef = useRef();
  const [height, setHeight] = useState(1);
  useEffect(() => {
    isLoading && setHeight(+imgRef.current.offsetWidth * 1.33)
  }, [isLoading]);
  
  const clickHandler = () => {
    navigate(`game/${id}`);
    dispatch({type: LOADING})
  }
  
  return (
    <Card raised ref={imgRef} sx={{ height: 1 }}>
      <CardActionArea onClick={clickHandler}>
        {isLoading
          ?
          <Skeleton variant="rectangular" height={height} />
          :
          <CardMedia
            component="img"
            image={image}
            alt={name}
          />}
        <CardContent>
          <Typography variant="h5" component="div">
            {isLoading ? <Skeleton /> : name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

