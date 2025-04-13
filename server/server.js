const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

// 测试数据库连接
const testDbConnection = async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('数据库连接成功:', result.rows[0]);
  } catch (err) {
    console.error('数据库连接失败:', err);
    process.exit(1);  // 如果连接失败，终止程序
  }
};

// 在服务器启动时测试数据库连接
testDbConnection();

// 中间件
app.use(cors());
app.use(express.json());

// 获取所有文章
app.get('/api/posts', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取指定文章
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM posts WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建文章
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const result = await db.query(
      'INSERT INTO posts (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 添加健康检查接口
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT NOW()');
    res.status(200).json({ status: 'healthy', message: 'Service is running and database is connected' });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', message: 'Database connection failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});