const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const novelRoutes = require('./routes/novel');
const promptRoutes = require('./routes/prompt');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由
app.get('/', (req, res) => {
  res.json({
    message: 'Novel to Animation API',
    version: '1.0.0',
    endpoints: {
      novels: '/api/novel',
      prompts: '/api/prompt',
    },
  });
});

app.use('/api/novel', novelRoutes);
app.use('/api/prompt', promptRoutes);

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
  console.log(`   - POST /api/prompt/generate - 生成 Prompt`);
  console.log(`   - GET  /api/prompt/:novelId - 获取所有 Prompt\n`);
});

module.exports = app;
