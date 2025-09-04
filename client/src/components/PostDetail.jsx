import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Button,
  Skeleton,
  Alert,
  Divider,
  Chip,
  Container
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Article as ArticleIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

function PostDetail() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
        if (error.response && error.response.status === 404) {
          setError('Post not found. It may have been deleted or moved.');
        } else {
          setError('Failed to load post. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" width={100} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="80%" height={48} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Skeleton variant="rectangular" width={120} height={32} />
            <Skeleton variant="rectangular" width={100} height={32} />
            <Skeleton variant="rectangular" width={80} height={32} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            to="/"
            startIcon={<BackIcon />}
            variant="outlined"
            sx={{ mb: 3 }}
          >
            Back to Posts
          </Button>
        </Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            to="/"
            startIcon={<BackIcon />}
            variant="outlined"
            sx={{ mb: 3, borderRadius: 2 }}
          >
            Back to Posts
          </Button>
        </Box>

        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: 'white'
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                lineHeight: 1.2,
                mb: 3,
                color: 'text.primary'
              }}
            >
              {post.title}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
              <Chip
                icon={<PersonIcon />}
                label={post.author ? post.author.username : 'Anonymous'}
                color="primary"
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<CalendarIcon />}
                label={formatDate(post.created_at)}
                color="secondary"
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<TimeIcon />}
                label={`${getReadingTime(post.content)} min read`}
                color="info"
                variant="outlined"
                size="small"
              />
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.8,
                fontSize: '1.1rem',
                color: 'text.secondary',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {post.content}
            </Typography>

            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Published on {formatDate(post.created_at)} at {formatTime(post.created_at)}
              </Typography>
            </Box>
          </motion.div>
        </Paper>
      </motion.div>
    </Container>
  );
}

export default PostDetail;