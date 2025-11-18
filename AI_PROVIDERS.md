# AI 提供商配置指南

本系统支持多种 AI 提供商，你可以根据需求选择最适合的服务。

## 支持的提供商

1. **OpenAI** - 最强大，但价格较高
2. **DeepSeek** - 性价比高，国内访问稳定（推荐）
3. **Custom** - 任何兼容 OpenAI API 格式的服务

---

## 配置方法

在 `.env` 文件中设置 `AI_PROVIDER` 参数：

```bash
AI_PROVIDER=deepseek  # 可选: openai, deepseek, custom
```

## 1. OpenAI 配置

### 特点
- ✅ 最强大的模型（GPT-4 Turbo）
- ✅ 响应质量最高
- ❌ 价格较贵
- ❌ 国内访问需要代理

### 价格（截至 2024）
- GPT-4 Turbo: $10/1M tokens (input), $30/1M tokens (output)
- 单次分析约 $0.10-0.30

### 配置步骤

1. 获取 API Key：https://platform.openai.com/api-keys

2. 编辑 `.env`：
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo-preview
```

3. 重启后端服务

---

## 2. DeepSeek 配置（推荐）

### 特点
- ✅ 性价比极高（比 OpenAI 便宜 95%）
- ✅ 国内访问稳定快速
- ✅ 支持中文，效果优秀
- ✅ 兼容 OpenAI API 格式
- ⚠️ 某些复杂任务略逊于 GPT-4

### 价格（截至 2024）
- DeepSeek Chat: ¥1/1M tokens (input), ¥2/1M tokens (output)
- 单次分析约 ¥0.01-0.03（约 $0.001-0.004）

### 配置步骤

1. 注册账号：https://platform.deepseek.com/

2. 获取 API Key：
   - 登录后台
   - 进入 API Keys 页面
   - 创建新的 API Key

3. 充值（支持微信、支付宝）：
   - 最低充值 ¥10
   - 可用很久

4. 编辑 `.env`：
```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

5. 重启后端服务

### 验证配置

启动后端后，看到以下日志表示成功：
```
✓ Using DeepSeek API
✓ Database connected
🚀 Server running on port 3001
```

---

## 3. Custom 自定义提供商

### 适用场景
- 使用其他兼容 OpenAI 格式的 API
- 自建模型服务
- 其他第三方代理服务

### 支持的服务示例
- **Azure OpenAI**: 微软提供的 OpenAI 服务
- **OpenRouter**: 多模型聚合服务
- **LocalAI**: 本地部署的开源方案
- **Claude API**: Anthropic 的 Claude（需要转换格式）
- 各种国内的 AI API 服务

### 配置步骤

1. 获取你的 API 信息：
   - API Key
   - Base URL（API 端点地址）
   - Model Name（模型名称）

2. 编辑 `.env`：
```bash
AI_PROVIDER=custom
CUSTOM_API_KEY=your_api_key_here
CUSTOM_BASE_URL=https://your-api-endpoint.com/v1
CUSTOM_MODEL=your-model-name
```

3. 重启后端服务

### 示例：Azure OpenAI

```bash
AI_PROVIDER=custom
CUSTOM_API_KEY=your_azure_key
CUSTOM_BASE_URL=https://your-resource.openai.azure.com/openai/deployments/your-deployment
CUSTOM_MODEL=gpt-4
```

---

## 价格对比

| 提供商 | 每次分析成本 | 月费（100次） | 国内访问 | 中文支持 |
|--------|-------------|--------------|---------|---------|
| OpenAI GPT-4 | $0.10-0.30 | $10-30 | 需要代理 | ⭐⭐⭐⭐ |
| DeepSeek | ¥0.01-0.03 | ¥1-3 | ✅ 稳定 | ⭐⭐⭐⭐⭐ |
| Custom | 取决于服务 | - | 取决于服务 | 取决于模型 |

---

## 性能对比

### 小说分析质量

| 提供商 | 角色提取 | 场景识别 | Prompt 质量 | 响应速度 |
|--------|---------|---------|------------|---------|
| OpenAI GPT-4 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 较慢（5-10s） |
| DeepSeek | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 快速（2-5s） |

**结论**：对于本应用场景，DeepSeek 完全够用且性价比极高。

---

## 切换提供商

随时可以切换提供商：

1. 编辑 `.env` 文件，修改 `AI_PROVIDER`
2. 填写对应的 API Key
3. 重启后端：`Ctrl+C` 停止，然后 `npm run dev`

---

## 故障排查

### 问题 1: API Key 无效

**错误信息**：`Missing API key for provider: xxx`

**解决方法**：
1. 检查 `.env` 文件中的 API Key 是否正确
2. 确保没有多余的空格或引号
3. DeepSeek Key 格式：`sk-xxxxxxxxxxxxxxxxxx`
4. 重启后端服务

### 问题 2: 网络连接失败

**错误信息**：`AI 分析失败: connect ETIMEDOUT`

**解决方法**：
- **OpenAI**: 检查代理设置
- **DeepSeek**: 检查网络连接
- 查看 DeepSeek 服务状态：https://status.deepseek.com/

### 问题 3: 余额不足

**错误信息**：`insufficient_quota` 或类似

**解决方法**：
1. 登录提供商后台查看余额
2. DeepSeek: 进入充值页面充值
3. OpenAI: 添加支付方式或充值

### 问题 4: 响应格式错误

**错误信息**：`Unexpected token` 或 JSON 解析错误

**解决方法**：
1. 某些模型不支持 JSON mode
2. 尝试更换模型或提供商
3. 查看后端日志详细错误

---

## 推荐配置

### 个人用户（推荐 DeepSeek）
```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_key
DEEPSEEK_MODEL=deepseek-chat
```

**优点**：
- 成本极低（几毛钱可以用很久）
- 国内访问稳定
- 中文效果好

### 专业用户/团队
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4-turbo-preview
```

**优点**：
- 最高质量
- 适合对输出质量要求极高的场景

### 开发测试
可以先用 DeepSeek 测试，确定功能后再决定是否升级到 OpenAI。

---

## 常见问题

**Q: 可以混用多个提供商吗？**
A: 目前只能同时使用一个提供商。未来版本可能支持按任务切换。

**Q: DeepSeek 的效果真的够用吗？**
A: 对于本应用（小说分析、Prompt 生成），DeepSeek 完全够用，且中文理解更好。

**Q: 如何获取 DeepSeek API Key？**
A: 访问 https://platform.deepseek.com/ 注册并创建 API Key。

**Q: 需要代理吗？**
A:
- OpenAI: 国内需要代理
- DeepSeek: 国内无需代理，直连即可

**Q: 可以使用免费的 API 吗？**
A: 可以，只要兼容 OpenAI 格式，使用 `custom` 配置即可。

---

## 更多帮助

- DeepSeek 文档：https://platform.deepseek.com/docs
- OpenAI 文档：https://platform.openai.com/docs
- 项目 Issues：https://github.com/your-repo/issues
