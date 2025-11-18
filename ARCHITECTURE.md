# 系统架构文档

## 项目概述

Novel to Animation Workflow Assistant 是一个 AI 驱动的工作流管理工具，帮助用户将小说文本转换为动画制作所需的各类 Prompt。

**核心理念**：不直接生成图像和视频，而是生成专业的 Prompt，让用户使用最适合的工具进行创作。

## 技术栈

### 后端
- **Node.js** + **Express**: RESTful API 服务
- **PostgreSQL**: 关系型数据库
- **OpenAI GPT-4**: 文本分析和 Prompt 生成
- **Docker**: 数据库容器化

### 前端
- **Next.js 14**: React 框架（App Router）
- **TypeScript**: 类型安全
- **TailwindCSS**: 样式框架
- **Axios**: HTTP 客户端

## 系统架构图

```
┌─────────────┐
│   Browser   │
│  (Next.js)  │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────────┐
│   Express API   │
│   /api/novel    │
│   /api/prompt   │
└────┬────────┬───┘
     │        │
     │        │
     ▼        ▼
┌─────────┐ ┌──────────────┐
│PostgreSQL│ │ OpenAI API   │
│ Database│ │ GPT-4 Turbo  │
└─────────┘ └──────────────┘
```

## 数据流程

### 1. 小说分析流程

```
用户输入小说
    ↓
前端验证并发送 POST /api/novel/analyze
    ↓
后端保存小说到数据库
    ↓
调用 OpenAI API 分析小说
    ↓
解析 AI 返回的 JSON
    ↓
保存角色、场景、情节到数据库
    ↓
返回分析结果给前端
    ↓
前端展示角色和场景信息
```

### 2. Prompt 生成流程

```
用户点击生成 Prompt
    ↓
前端发送 POST /api/prompt/generate
    ↓
后端从数据库读取角色和场景
    ↓
遍历每个角色，调用 AI 生成角色 Prompt
    ↓
遍历每个场景，调用 AI 生成场景 Prompt
    ↓
保存所有 Prompt 到数据库
    ↓
返回 Prompt 列表给前端
    ↓
前端展示 Prompt 卡片
    ↓
用户复制 Prompt
```

## 数据库设计

### ER 图

```
projects (项目)
    ↓ 1:N
novels (小说)
    ↓ 1:N
    ├── characters (角色)
    ├── scenes (场景)
    └── plot_segments (情节片段)
        ↓ 1:N
        └── image_prompts (图像 Prompt)
                ↓ 1:N
                └── uploaded_images (上传的图像)
                        ↓ 1:N
                        └── animation_prompts (动画 Prompt)
```

### 核心表结构

**novels**: 存储小说文本
- id, project_id, title, content, word_count, analyzed

**characters**: 角色信息
- id, novel_id, name, description, appearance, personality, role

**scenes**: 场景信息
- id, novel_id, scene_number, title, description, location, time_of_day, atmosphere

**image_prompts**: 图像生成 Prompt
- id, novel_id, type, reference_id, reference_type, prompt, negative_prompt, style

**animation_prompts**: 动画生成 Prompt（待实现）
- id, novel_id, scene_id, uploaded_image_id, prompt, camera_movement, duration_seconds

## API 设计

### Novel API

#### POST /api/novel/analyze
分析小说文本

**请求体**:
```json
{
  "title": "小说标题",
  "content": "小说内容",
  "projectId": 1  // 可选
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "novel": { "id": 1, "title": "...", ... },
    "characters": [...],
    "scenes": [...],
    "plotSegments": [...]
  }
}
```

#### GET /api/novel/:id
获取小说详情

**响应**: 同上

#### GET /api/novel
获取所有小说列表

### Prompt API

#### POST /api/prompt/generate
生成图像 Prompt

**请求体**:
```json
{
  "novelId": 1
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "characterPrompts": [...],
    "scenePrompts": [...]
  }
}
```

#### GET /api/prompt/:novelId
获取小说的所有 Prompt

#### PUT /api/prompt/:id
更新 Prompt（用户可编辑）

## AI 提示词设计

### 小说分析提示词

**目标**: 提取角色、场景、情节

**策略**:
1. 使用 JSON mode 确保结构化输出
2. 明确要求详细的外貌描述（为图像生成做准备）
3. 场景描述包含视觉要素（环境、光线、氛围）
4. 按时间顺序组织内容

### Prompt 生成提示词

**角色 Prompt**:
- 转换为英文关键词
- 包含画风、质量词
- 强调角色一致性特征
- 提供负面 Prompt

**场景 Prompt**:
- 环境、光线、构图
- 适配动漫风格
- 包含角色位置（如果有）
- 电影化视角

## 前端架构

### 页面结构

```
app/
├── layout.tsx          # 全局布局
├── page.tsx            # 主页（分析 + Prompt 生成）
├── novels/
│   ├── page.tsx        # 小说列表
│   └── [id]/
│       └── page.tsx    # 小说详情
└── globals.css         # 全局样式
```

### 状态管理

使用 React Hooks（useState）进行本地状态管理。

**主要状态**:
- `step`: 当前步骤（1: 输入, 2: 分析, 3: Prompt）
- `result`: 分析结果
- `prompts`: 生成的 Prompt
- `loading`: 加载状态
- `error`: 错误信息

### UI/UX 设计

**设计原则**:
1. 清晰的步骤指示
2. 即时反馈（加载、成功、错误）
3. 一键复制功能
4. 响应式设计

**配色方案**:
- 主色：靛蓝色（Indigo）
- 角色：蓝色
- 场景：绿色
- 错误：红色

## 安全考虑

### 输入验证
- 使用 express-validator 验证请求
- 限制文本长度（防止过大请求）
- XSS 防护

### API 安全
- CORS 配置
- Rate Limiting（待实现）
- API Key 环境变量存储

### 数据库安全
- 参数化查询（防 SQL 注入）
- 数据库密码不入版本控制

## 性能优化

### 当前优化
- 数据库索引
- JSON mode 减少 AI 解析错误

### 待优化
- 请求队列（处理并发）
- 缓存机制（Redis）
- 图像 CDN
- 分页加载

## 扩展性

### 第二阶段（图像管理）
- 图像上传 API
- 图像存储（MinIO/S3）
- 图像与场景关联

### 第三阶段（动画 Prompt）
- 图像分析（Vision API）
- 多平台适配（Runway/Pika）
- 时间轴编辑器

### 第四阶段（高级功能）
- 用户系统
- 项目协作
- 自定义风格
- 批量处理

## 部署架构（生产环境）

```
┌────────────┐
│   Nginx    │  反向代理 + 静态文件
└─────┬──────┘
      │
      ├─→ Next.js (SSR)
      │
      └─→ Express API
             │
             ├─→ PostgreSQL (RDS)
             └─→ OpenAI API
```

## 监控和日志

### 日志记录
- 请求日志（时间、方法、路径）
- 错误日志（堆栈跟踪）
- AI 调用日志

### 待实现
- 错误追踪（Sentry）
- 性能监控（New Relic）
- 用户行为分析

## 开发规范

### Git 工作流
- main: 生产环境
- develop: 开发环境
- feature/*: 功能分支

### 代码规范
- ESLint + Prettier
- TypeScript 严格模式
- 语义化命名

### 提交规范
- feat: 新功能
- fix: 修复
- docs: 文档
- refactor: 重构
- test: 测试

## 测试策略（待实现）

- 单元测试（Jest）
- API 集成测试（Supertest）
- E2E 测试（Playwright）

## 常见问题

**Q: 为什么不直接生成图像？**
A: 专业工具（Midjourney/SD）效果更好，成本更可控，用户有更多创作自由。

**Q: 支持哪些语言？**
A: 目前主要支持中文，AI 会自动生成英文 Prompt。

**Q: 如何保证角色一致性？**
A: 第二阶段将支持角色 LoRA 训练建议和 IP-Adapter 参数。

**Q: 可以商用吗？**
A: MIT 许可证，但请注意 OpenAI 使用条款。
