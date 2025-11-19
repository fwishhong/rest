const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: '../.env' });

const novelRoutes = require('./routes/novel');
const promptRoutes = require('./routes/prompt');
const imageRoutes = require('./routes/image');
const animationRoutes = require('./routes/animation');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务（提供上传的图片）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由
app.get('/', (req, res) => {
  res.json({
    message: 'Novel to Animation API',
    version: '2.0.0',
    endpoints: {
      novels: '/api/novel',
      prompts: '/api/prompt',
      images: '/api/images',
      animations: '/api/animation',
    },
  });
});

app.use('/api/novel', novelRoutes);
app.use('/api/prompt', promptRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/animation', animationRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📝 API: http://localhost:${PORT}`);
  console.log(`🔗 Endpoints:`);
  console.log(`   - POST /api/novel/analyze - 分析小说`);
  console.log(`   - GET  /api/novel/:id - 获取小说详情`);
  console.log(`   - POST /api/prompt/generate - 生成图像 Prompt`);
  console.log(`   - GET  /api/prompt/:novelId - 获取所有图像 Prompt`);
  console.log(`   - POST /api/images/upload - 上传图片`);
  console.log(`   - GET  /api/images/:novelId - 获取小说的所有图片`);
  console.log(`   - POST /api/animation/generate - 生成视频 Prompt`);
  console.log(`   - GET  /api/animation/:novelId - 获取所有视频 Prompt\n`);
});

module.exports = app;
