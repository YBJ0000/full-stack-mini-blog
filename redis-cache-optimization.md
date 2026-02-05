# 使用 Redis 缓存优化 API 响应

在我们的项目中，我们使用 Redis 来缓存频繁查询的数据，减少数据库访问次数，从而提升 API 响应速度。当数据更新时，我们会清除相关缓存，确保用户获取到最新的数据。

## 代码示例

### 1. 获取文章列表 - 使用缓存

```javascript
app.get('/api/posts', async (req, res) => {
  try {
    // 首先尝试从 Redis 缓存中获取数据
    if (redisClient) {
      const cachedPosts = await redisClient.get('all_posts');
      if (cachedPosts) {
        console.log(`🔥 Served from Redis cache`);
        return res.json(JSON.parse(cachedPosts));
      }
    }

    // 如果缓存中没有，从数据库查询
    const posts = await prisma.post.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        author: { select: { username: true } }
      }
    });

    // 将查询结果存入 Redis，设置 60 秒过期时间
    if (redisClient) {
      await redisClient.setEx('all_posts', 60, JSON.stringify(posts));
    }
    
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### 2. 创建文章 - 清除缓存

```javascript
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    // ... 创建文章的代码 ...
    const post = await prisma.post.create({
      data: { title, content, authorId }
    });

    // 清除文章列表缓存，确保下次获取时是最新数据
    if (redisClient) {
      await redisClient.del('all_posts');
    }
    
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

## 优化效果

- **首次请求**：从数据库查询，响应时间约 50-100ms
- **后续请求**：从 Redis 缓存读取，响应时间约 1-5ms
- **缓存过期**：60 秒后自动失效，重新从数据库获取最新数据
