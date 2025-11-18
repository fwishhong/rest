# 快速启动指南

## 前置要求

- Node.js 18+
- Docker 和 Docker Compose
- OpenAI API Key

## 启动步骤

### 1. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的 OpenAI API Key
nano .env  # 或使用你喜欢的编辑器
```

**重要**：必须设置 `OPENAI_API_KEY`

### 2. 启动数据库

```bash
docker-compose up -d
```

等待 PostgreSQL 启动（约 10-15 秒），数据库表会自动创建。

### 3. 启动后端

```bash
cd backend
npm install
npm run dev
```

后端将在 http://localhost:3001 启动

### 4. 启动前端（新终端窗口）

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:3000 启动

### 5. 访问应用

打开浏览器访问：http://localhost:3000

## 使用流程

1. **输入小说**
   - 在首页输入小说标题和内容
   - 建议 500-5000 字以获得最佳效果

2. **AI 分析**
   - 点击"开始分析并生成 Prompt"
   - 系统会自动提取角色、场景、情节

3. **获取 Prompt**
   - 查看生成的图像 Prompt
   - 点击"复制 Prompt"按钮
   - 粘贴到 Midjourney/Stable Diffusion 等工具

4. **生成图像**
   - 使用复制的 Prompt 在图像生成工具中创建图像

5. **（即将支持）动画化**
   - 上传生成的图像
   - 获取视频生成 Prompt

## 测试示例

你可以使用以下示例文本测试：

**标题**: 魔法学院的相遇

**内容**:
```
清晨的阳光透过彩色玻璃窗洒进教室，艾莉娅坐在靠窗的位置，长长的银色头发在光线下闪闪发光。她穿着学院的深蓝色制服，正专注地阅读着一本古老的魔法书。

教室门突然被推开，一个黑发少年匆忙跑了进来。他叫凯文，是学院里最有天赋的火系魔法师，但总是迟到。

"对不起，莱恩教授！"凯文气喘吁吁地说。

莱恩教授站在讲台上，他是一位年长的魔法师，白色的长袍上绣着金色的符文。他严肃地看着凯文，但眼中闪过一丝笑意。

"凯文，这已经是本周第三次了。"莱恩教授说道。

艾莉娅抬起头，冰蓝色的眼睛看向凯文。两人的目光在空中相遇，一种奇妙的感觉在空气中蔓延...
```

## 故障排查

### 后端无法启动
- 检查数据库是否正在运行：`docker ps`
- 检查环境变量是否正确设置
- 确保端口 3001 没有被占用

### 前端无法连接后端
- 确认后端已启动
- 检查 `.env` 中的 `NEXT_PUBLIC_API_URL`
- 查看浏览器控制台的错误信息

### AI 分析失败
- 确认 OpenAI API Key 是否有效
- 检查 API 配额是否充足
- 查看后端控制台的错误信息

## 开发命令

```bash
# 查看数据库日志
docker-compose logs -f postgres

# 停止数据库
docker-compose down

# 重置数据库（会删除所有数据）
docker-compose down -v
docker-compose up -d

# 后端开发模式（自动重启）
cd backend && npm run dev

# 前端开发模式（热更新）
cd frontend && npm run dev
```

## API 端点

- `POST /api/novel/analyze` - 分析小说文本
- `GET /api/novel/:id` - 获取小说详情
- `GET /api/novel` - 获取所有小说
- `POST /api/prompt/generate` - 生成图像 Prompt
- `GET /api/prompt/:novelId` - 获取小说的所有 Prompt
- `PUT /api/prompt/:id` - 更新 Prompt

## 下一步开发计划

- [ ] 图像上传功能
- [ ] 图像管理和预览
- [ ] 动画 Prompt 生成（适配 Runway/Pika）
- [ ] 项目管理功能
- [ ] 用户认证
- [ ] 导出功能（PDF/JSON）

## 技术支持

如有问题，请查看：
- 后端日志
- 前端浏览器控制台
- 数据库日志：`docker-compose logs postgres`
