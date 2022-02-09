import { styled, alpha } from '@mui/material/styles';
import { AppBar, Box, Toolbar, InputBase, Link } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Search = styled('form')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25)
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto'
  }
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '20em'
  }
}));

export default function SearchAppBar() {
  const [value, setValue] = useState('');
  const navigate = useNavigate();
  
  const changeHandler = event => {
    setValue(event.target.value.trim() && event.target.value);
  }
  
  const submitHandler = event => {
    event.preventDefault();
    if (!value.trim()) return;
    let query = value.trim();
    setValue('');
    navigate(`search?query=${query}`);
  }
  
  return (
    <Box >
      <AppBar position="static" sx={{ backgroundColor: 'grey.900' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link
            underline='none'
            color='inherit'
            variant="h5"
            component={RouterLink}
            to="/"
            sx={{ flexShrink: 0, display: { xs: 'none', sm: 'block' } }}
          >
            GAMEFINDER
          </Link>
          <Search onSubmit={submitHandler}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search game…"
              inputProps={{ 'aria-label': 'search' }}
              onChange={changeHandler}
              value={value}
            />
          </Search>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
