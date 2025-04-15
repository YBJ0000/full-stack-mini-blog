const express = require('express');
const cors = require('cors');
// const db = require('./db'); // 移除原有的 pg 数据库连接
const redisClient = require('./redis');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client'); // 导入 PrismaClient

const prisma = new PrismaClient(); // 创建 PrismaClient 实例

const app = express();

// 测试数据库连接
const testDbConnection = async () => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('数据库连接成功:', result);
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
// 修改获取所有文章的接口，添加 Redis 缓存
app.get('/api/posts', async (req, res) => {
  try {
    const cachedPosts = await redisClient.get('all_posts');
    if (cachedPosts) {
      console.log(`🔥 Served from Redis cache at ${new Date().toISOString()}`);
      return res.json(JSON.parse(cachedPosts));
    }

    console.log(`📡 Served from DB at ${new Date().toISOString()}`);
    const posts = await prisma.posts.findMany({  // 改为 posts（复数）
      orderBy: {
        created_at: 'desc',  // 改为 created_at
      },
    });
    
    await redisClient.setEx('all_posts', 60, JSON.stringify(posts));
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 修改创建文章接口
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const post = await prisma.posts.create({  // 改为 posts（复数）
      data: {
        title,
        content,
      },
    });
    
    // 清除文章列表缓存
    await redisClient.del('all_posts');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取指定文章
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.posts.findUnique({  // 改为 posts（复数）
      where: { id: parseInt(id) },
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 添加健康检查接口
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT NOW()`;
    res.status(200).json({ status: 'healthy', message: 'Service is running and database is connected' });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', message: 'Database connection failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});