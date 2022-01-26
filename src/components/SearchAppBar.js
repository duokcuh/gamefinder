import { styled, alpha } from '@mui/material/styles';
import { AppBar, Box, Toolbar, Typography, InputBase,  } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { SET_QUERY } from '../store/store';

const Search = styled('form')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '20em',
  },
}));

export default function SearchAppBar() {
  const [value, setValue] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const changeHandler = event => {
    setValue(event.target.value.trim() && event.target.value);
  }
  
  const submitHandler = event => {
    event.preventDefault();
    if(!value.trim()) return;
    dispatch({ type: SET_QUERY, payload: value.trim()});
    setValue('');
    navigate('/');
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{ flexGrow: 1, flexShrink: 0, display: { xs: 'none', sm: 'block' } }}
          >
            GAMEFINDER
          </Typography>
          <Search onSubmit={submitHandler}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search game…"
              inputProps={{ 'aria-label': 'search'}}
              onChange={changeHandler}
              value={value}
            />
          </Search>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
