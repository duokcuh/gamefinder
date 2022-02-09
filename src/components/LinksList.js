import { List, ListItem, ListItemButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

export const LinksList = ({ links }) => {
  return (
    <List disablePadding={true} sx={{ display: 'inline' }}>
      {
        links.map(item => {
          return (
            <ListItem
              key={item.id}
              disablePadding={true}
              sx={{ display: 'inline' }}
            >
              <ListItemButton
                component={RouterLink}
                to={`/game/${item.id}`}
                disableGutters={true}
                sx={{
                  display: 'inline-block',
                  color: 'primary.main',
                  mr: 0.5,
                  p: 0,
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1)
                }}
              >
                {item.name}
              </ListItemButton>
            </ListItem>
          )
        })
      }
    </List>
  );
};
