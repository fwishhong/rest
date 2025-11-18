const OpenAI = require('openai');

/**
 * 获取 AI 客户端配置
 * 根据环境变量 AI_PROVIDER 返回相应的配置
 */
function getAIClient() {
  const provider = process.env.AI_PROVIDER || 'openai';

  let config = {};
  let model = '';

  switch (provider.toLowerCase()) {
    case 'deepseek':
      console.log('✓ Using DeepSeek API');
      config = {
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      };
      model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
      break;

    case 'custom':
      console.log('✓ Using Custom API');
      config = {
        apiKey: process.env.CUSTOM_API_KEY,
        baseURL: process.env.CUSTOM_BASE_URL,
      };
      model = process.env.CUSTOM_MODEL || 'gpt-4-turbo-preview';
      break;

    case 'openai':
    default:
      console.log('✓ Using OpenAI API');
      config = {
        apiKey: process.env.OPENAI_API_KEY,
      };
      model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
      break;
  }

  // 验证必要的配置
  if (!config.apiKey) {
    throw new Error(`Missing API key for provider: ${provider}. Please check your .env file.`);
  }

  const client = new OpenAI(config);

  return { client, model, provider };
}

module.exports = { getAIClient };
