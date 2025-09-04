import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Title as TitleIcon,
  Description as ContentIcon,
  Send as SendIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to create a post.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/posts`,
        { title: title.trim(), content: content.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to create post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setError('');
    setSuccess(false);
  };

  const characterCount = content.length;
  const maxCharacters = 5000;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '60vh',
        py: 4
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 800 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <EditIcon sx={{ color: 'white', fontSize: 30 }} />
              </Box>
            </motion.div>

            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Create New Post
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Share your thoughts and ideas with the community
            </Typography>
          </Box>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert severity="success" sx={{ mb: 3 }}>
                Post created successfully! Redirecting to home page...
              </Alert>
            </motion.div>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              margin="normal"
              variant="outlined"
              placeholder="Enter a compelling title for your post..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              label="Post Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              margin="normal"
              variant="outlined"
              multiline
              rows={12}
              placeholder="Write your post content here..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <ContentIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 3 }}>
              <Chip
                label={`${characterCount}/${maxCharacters} characters`}
                color={characterCount > maxCharacters * 0.9 ? 'warning' : 'default'}
                size="small"
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !title.trim() || !content.trim() || characterCount > maxCharacters}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textTransform: 'none'
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <>
                      <SendIcon sx={{ mr: 1 }} />
                      Publish Post
                    </>
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}

export default CreatePost;