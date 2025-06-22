const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const express = require('express');
const cors = require('cors');
// const db = require('./db'); // 移除原有的 pg 数据库连接
let redisClient;
if (process.env.NODE_ENV === 'production') {
  redisClient = require('./redis');
}
const { PrismaClient } = require('@prisma/client'); // 导入 PrismaClient
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 新增：用户注册
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    res.status(201).json({ id: user.id, username: user.username });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// 新增：用户登录
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取所有文章
// 修改获取所有文章的接口，添加 Redis 缓存
app.get('/api/posts', async (req, res) => {
  try {
    if (redisClient) {
      const cachedPosts = await redisClient.get('all_posts');
      if (cachedPosts) {
        console.log(`🔥 Served from Redis cache at ${new Date().toISOString()}`);
        return res.json(JSON.parse(cachedPosts));
      }
    }

    console.log(`📡 Served from DB at ${new Date().toISOString()}`);
    const posts = await prisma.post.findMany({  // 改为 post（单数）
      orderBy: {
        created_at: 'desc',  // 改为 created_at
      },
      include: {
        author: {
          select: {
            username: true,
          }
        }
      }
    });

    if (redisClient) {
      await redisClient.setEx('all_posts', 60, JSON.stringify(posts));
    }
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 修改创建文章接口
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const authorId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const post = await prisma.post.create({  // 改为 post（单数）
      data: {
        title,
        content,
        authorId,
      },
    });

    // 清除文章列表缓存
    if (redisClient) {
      await redisClient.del('all_posts');
    }
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取指定文章
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({  // 改为 post（单数）
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            username: true,
          }
        }
      }
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