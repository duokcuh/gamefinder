import { Card, CardActionArea, CardContent, CardMedia, Skeleton } from '@mui/material';
import Typography from '@mui/material/Typography';

export const GameItem = ({ name, image, isLoading = true }) => {
  return (
    <Card raised sx={{ height: 1 }}>
      <CardActionArea>
        {isLoading ?
          <Skeleton variant="rectangular" width="100%" height={200} />
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

