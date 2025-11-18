# 云端部署指南

这个指南将帮助你把"小说转动画工作流助手"部署到云端，**完全免费**，无需本地运行。

## 🌟 部署方案

- **前端**: Vercel（免费，全球 CDN）
- **后端**: Railway（免费 500 小时/月）
- **数据库**: SQLite（内置，无需配置）
- **总成本**: 🆓 **免费**

---

## 📋 准备工作

1. **GitHub 账号**：https://github.com
2. **Vercel 账号**：https://vercel.com（用 GitHub 登录）
3. **Railway 账号**：https://railway.app（用 GitHub 登录）
4. **DeepSeek API Key**：你已经有了 `sk-53563e84c40244b090f9808c4e48ae98`

---

## 🚀 第一步：推送代码到 GitHub

### 1. 创建 GitHub 仓库

访问 https://github.com/new 创建新仓库：
- 仓库名：`novel2anime`（或任意名称）
- 选择：**Public** 或 **Private**
- **不要**初始化 README

### 2. 推送现有代码

你的代码已经在 Git 仓库中，现在需要推送到 GitHub：

```bash
# 查看当前远程地址
cd /home/user/rest
git remote -v

# 如果需要更换为 GitHub 地址（替换为你的仓库地址）
git remote set-url origin https://github.com/你的用户名/novel2anime.git

# 推送代码
git push -u origin claude/claude-md-mi393uwdole6tluj-01BLcm79sECQgd5fGa4FpqBn

# 或者推送到 main 分支
git checkout -b main
git push -u origin main
```

---

## 🎨 第二步：部署前端到 Vercel

### 1. 登录 Vercel

访问 https://vercel.com 并用 GitHub 登录

### 2. 导入项目

1. 点击 **"Add New Project"**
2. 选择你的 GitHub 仓库 `novel2anime`
3. 点击 **"Import"**

### 3. 配置项目

在配置页面：

**Framework Preset**: Next.js（自动检测）

**Root Directory**: 点击 **"Edit"**，选择 `frontend`

**Build Settings**（自动填充，无需修改）:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Environment Variables**: 点击 **"Add"**，添加：

```
Name: NEXT_PUBLIC_API_URL
Value: https://你的后端地址.railway.app
```

**注意**: 后端地址稍后会从 Railway 获取，现在先留空或填：`https://placeholder.railway.app`

### 4. 部署

点击 **"Deploy"**，等待 2-3 分钟

部署成功后，你会得到一个网址，类似：
```
https://novel2anime-xxxxx.vercel.app
```

---

## ⚙️ 第三步：部署后端到 Railway

### 1. 登录 Railway

访问 https://railway.app 并用 GitHub 登录

### 2. 创建新项目

1. 点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 选择你的仓库 `novel2anime`
4. Railway 会自动检测到 Node.js 项目

### 3. 配置 Root Directory

1. 点击项目
2. 进入 **"Settings"** 标签
3. 找到 **"Root Directory"**
4. 设置为：`backend`
5. 点击 **"Save"**

### 4. 添加环境变量

在 **"Variables"** 标签中，添加以下环境变量：

```bash
# 数据库配置
USE_SQLITE=true

# AI 配置
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-53563e84c40244b090f9808c4e48ae98
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# 服务器配置
PORT=3001
NODE_ENV=production
```

### 5. 获取后端 URL

1. 进入 **"Settings"** 标签
2. 找到 **"Domains"** 部分
3. 点击 **"Generate Domain"**
4. 复制生成的域名，类似：`https://novel2anime-backend-production.up.railway.app`

### 6. 重新部署

点击 **"Deployments"** 标签，等待部署完成（约 2-3 分钟）

---

## 🔗 第四步：连接前后端

### 1. 更新 Vercel 环境变量

1. 回到 Vercel 项目
2. 进入 **"Settings"** → **"Environment Variables"**
3. 更新 `NEXT_PUBLIC_API_URL` 为你的 Railway 后端地址：
   ```
   https://novel2anime-backend-production.up.railway.app
   ```
4. 点击 **"Save"**

### 2. 重新部署前端

1. 进入 **"Deployments"** 标签
2. 点击最新的部署
3. 点击右上角的 **"..."** 菜单
4. 选择 **"Redeploy"**
5. 等待重新部署完成

---

## ✅ 第五步：测试应用

### 1. 访问你的网站

打开浏览器，访问你的 Vercel 网址：
```
https://novel2anime-xxxxx.vercel.app
```

### 2. 测试功能

使用示例文本测试：

**标题**: 魔法学院的相遇

**内容**:
```
清晨的阳光透过彩色玻璃窗洒进教室，艾莉娅坐在靠窗的位置，长长的银色头发在光线下闪闪发光。她穿着学院的深蓝色制服，正专注地阅读着一本古老的魔法书。

教室门突然被推开，一个黑发少年匆忙跑了进来。他叫凯文，是学院里最有天赋的火系魔法师，但总是迟到。

"对不起，莱恩教授！"凯文气喘吁吁地说。

莱恩教授站在讲台上，他是一位年长的魔法师，白色的长袍上绣着金色的符文。他严肃地看着凯文，但眼中闪过一丝笑意。

艾莉娅抬起头，冰蓝色的眼睛看向凯文。两人的目光在空中相遇，一种奇妙的感觉在空气中蔓延...
```

点击"开始分析并生成 Prompt"，如果能看到分析结果，说明部署成功！

---

## 📊 部署后的访问地址

部署完成后，你会有：

- **前端网址**: `https://novel2anime-xxxxx.vercel.app`（分享给别人使用）
- **后端 API**: `https://novel2anime-backend-production.up.railway.app`（内部调用）

---

## 🔧 常见问题

### 问题 1: 前端无法连接后端

**检查**:
1. Vercel 环境变量 `NEXT_PUBLIC_API_URL` 是否正确
2. Railway 后端是否成功部署（查看 Logs）
3. 重新部署 Vercel 前端

### 问题 2: Railway 部署失败

**检查**:
1. Root Directory 是否设置为 `backend`
2. 环境变量是否全部添加
3. 查看 Railway 的 Build Logs 了解错误

### 问题 3: AI 分析失败

**检查**:
1. DeepSeek API Key 是否正确
2. DeepSeek 账户余额是否充足
3. 查看 Railway Logs 了解详细错误

### 问题 4: 数据丢失

**说明**: Railway 免费版使用临时存储，重启后 SQLite 数据会丢失

**解决方案**:
1. 升级到 Railway Pro（$5/月）获得持久存储
2. 或使用 Railway 提供的 PostgreSQL 插件（免费）
3. 修改 `.env`: `USE_SQLITE=false`

---

## 📈 监控和日志

### Vercel 日志
1. 进入项目
2. 点击 **"Deployments"**
3. 选择部署记录查看 Build Logs 和 Runtime Logs

### Railway 日志
1. 进入项目
2. 点击 **"Deployments"**
3. 查看实时日志

---

## 🔄 更新部署

当你修改代码后：

### 1. 推送到 GitHub
```bash
git add .
git commit -m "更新功能"
git push
```

### 2. 自动部署
- Vercel 和 Railway 会**自动检测**代码变化并重新部署
- 无需手动操作！

---

## 💰 费用说明

### 免费额度

| 服务 | 免费额度 | 限制 |
|------|---------|------|
| **Vercel** | 无限部署 | 100GB 带宽/月 |
| **Railway** | 500 小时/月 | $5 免费额度 |
| **DeepSeek** | 按使用付费 | 极低价格（¥1/百万 tokens）|

### 预估月费用
- **个人使用**: 完全免费（在免费额度内）
- **DeepSeek**: 约 ¥1-5/月（取决于使用量）
- **总计**: 约 ¥1-5/月

---

## 🎉 部署完成！

现在你的应用已经在云端运行了：

✅ 24/7 在线
✅ 全球访问
✅ 自动更新
✅ 无需本地运行

分享你的网址给朋友，让他们也试试吧！

---

## 🔒 安全建议

1. **不要分享** DeepSeek API Key
2. **不要提交** `.env` 文件到公开仓库
3. 考虑添加用户认证（未来功能）
4. 定期检查 Railway/Vercel 使用量

---

## 📚 其他部署选项

如果你想尝试其他平台：

### 选项 A: Netlify + Render
- 前端：Netlify（类似 Vercel）
- 后端：Render（类似 Railway）

### 选项 B: 全部 Vercel
- 使用 Vercel Serverless Functions
- 需要修改后端为 Serverless 格式

### 选项 C: 阿里云/腾讯云
- 适合国内用户
- 需要备案
- 更好的国内访问速度

---

## 🆘 需要帮助？

遇到问题请查看：
1. Vercel 文档：https://vercel.com/docs
2. Railway 文档：https://docs.railway.app
3. 项目 Issues

---

祝你部署顺利！🚀
