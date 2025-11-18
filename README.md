# Novel to Animation Workflow Assistant

帮助用户管理"小说→图像→动画"的完整工作流，生成各阶段所需的 Prompt。

## 功能特性

### 第一阶段：小说 → 图像 Prompt
- 上传/输入小说文本
- AI 自动分析提取角色、场景、情节
- 生成图像生成 Prompt（适配 Midjourney/Stable Diffusion）

### 第二阶段：图像 → 动画 Prompt（开发中）
- 上传生成的图像
- AI 分析图像内容
- 生成动画化 Prompt（适配 Runway/Pika 等工具）

## 技术栈

- **前端**: Next.js 14, React, TailwindCSS
- **后端**: Node.js, Express, PostgreSQL
- **AI**: 支持多种提供商（OpenAI / DeepSeek / 自定义）

## 快速开始

### 1. 启动数据库
```bash
docker-compose up -d
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置 AI 提供商
```

**推荐配置（DeepSeek - 国内用户）**：
```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-your-key-here
```

💡 **详细配置指南**：查看 [AI_PROVIDERS.md](AI_PROVIDERS.md)

### 3. 启动后端
```bash
cd backend
npm install
npm run dev
```

### 4. 启动前端
```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
rest/
├── frontend/          # Next.js 前端
├── backend/           # Node.js API
├── shared/            # 共享类型定义
├── uploads/           # 上传文件存储
└── docker-compose.yml # 数据库容器
```

## API 文档

### 小说分析
- `POST /api/novel/analyze` - 分析小说文本
- `GET /api/novel/:id` - 获取小说详情

### Prompt 生成
- `POST /api/prompt/generate` - 生成图像 Prompt
- `GET /api/prompt/:novelId` - 获取小说的所有 Prompt

## License

MIT
