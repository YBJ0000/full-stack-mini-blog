import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function PostDetail() {
  const [post, setPost] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [id]);

  if (!post) return <div>加载中...</div>;

  return (
    <div>
      <Link to="/">返回首页</Link>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <p>发布时间: {new Date(post.created_at).toLocaleDateString()}</p>
    </div>
  );
}

export default PostDetail;