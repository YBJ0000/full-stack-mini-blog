import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import {
  Home as HomeIcon,
  Add as AddIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import CreatePost from './components/CreatePost';
import Login from './components/Login';
import Register from './components/Register';

// 创建主题
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" elevation={2}>
            <Container maxWidth="lg">
              <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography
                  variant="h6"
                  component={Link}
                  to="/"
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    fontWeight: 'bold'
                  }}
                >
                  Mini Blog
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/"
                    startIcon={<HomeIcon />}
                  >
                    Home
                  </Button>

                  {isLoggedIn ? (
                    <>
                      <Button
                        color="inherit"
                        component={Link}
                        to="/new"
                        startIcon={<AddIcon />}
                      >
                        Create Post
                      </Button>
                      <Button
                        color="inherit"
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        color="inherit"
                        component={Link}
                        to="/login"
                        startIcon={<LoginIcon />}
                      >
                        Login
                      </Button>
                      <Button
                        color="inherit"
                        component={Link}
                        to="/register"
                        startIcon={<RegisterIcon />}
                      >
                        Register
                      </Button>
                    </>
                  )}
                </Box>
              </Toolbar>
            </Container>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PostList />
                  </motion.div>
                } />
                <Route path="/post/:id" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PostDetail />
                  </motion.div>
                } />
                <Route path="/new" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CreatePost />
                  </motion.div>
                } />
                <Route path="/login" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Login onLoginSuccess={handleLoginSuccess} />
                  </motion.div>
                } />
                <Route path="/register" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Register />
                  </motion.div>
                } />
              </Routes>
            </AnimatePresence>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
