import { Card, CardActionArea, CardContent, CardMedia, Skeleton } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';

export const GameItem = ({ name, image, isLoading = true }) => {
  let imgRef = useRef();
  const [height, setHeight] = useState(1);
  useEffect(() => {
    isLoading && setHeight(+imgRef.current.offsetWidth * 1.33)
  }, [isLoading])
  
  return (
    <Card raised ref={imgRef} sx={{ height: 1 }}>
      <CardActionArea>
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

