const { getAIClient } = require('./aiClient');

/**
 * 生成角色图像 Prompt
 */
async function generateCharacterPrompt(character) {
  try {
    const { client, model } = getAIClient();
    const systemPrompt = `你是一个专业的 AI 绘画 Prompt 工程师，擅长将角色描述转换为高质量的图像生成 Prompt。

要求：
1. Positive Prompt 要详细、专业，使用英文，适合 Stable Diffusion/Midjourney
2. 包含画风、质量、细节等关键词
3. 使用逗号分隔关键词
4. Negative Prompt 要包含常见的负面词汇
5. 确保角色外貌特征清晰明确，便于后续生成一致的角色形象

返回 JSON 格式：
{
  "positive": "正向 Prompt",
  "negative": "负向 Prompt"
}`;

    const userPrompt = `请为以下角色生成图像 Prompt：

角色名称：${character.name}
外貌描述：${character.appearance}
性格特点：${character.personality}
角色定位：${character.role}

风格：anime, detailed, high quality`;

    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('生成角色 Prompt 失败:', error);
    // 返回默认 Prompt
    return {
      positive: `character design, ${character.appearance}, anime style, detailed, high quality, masterpiece`,
      negative: 'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry',
    };
  }
}

/**
 * 生成场景图像 Prompt
 */
async function generateScenePrompt(scene, characters) {
  try {
    const { client, model } = getAIClient();
    const systemPrompt = `你是一个专业的 AI 绘画 Prompt 工程师，擅长将场景描述转换为高质量的图像生成 Prompt。

要求：
1. Positive Prompt 要详细、专业，使用英文
2. 包含环境、光线、氛围、构图等关键词
3. 如果场景中有角色，要简要描述角色位置和动作
4. 使用逗号分隔关键词
5. Negative Prompt 要包含常见的负面词汇

返回 JSON 格式：
{
  "positive": "正向 Prompt",
  "negative": "负向 Prompt"
}`;

    const involvedCharacters = characters.filter(c =>
      scene.characters_involved && scene.characters_involved.includes(c.name)
    );

    const characterDesc = involvedCharacters.length > 0
      ? `\n参与角色：${involvedCharacters.map(c => `${c.name}(${c.appearance})`).join(', ')}`
      : '';

    const userPrompt = `请为以下场景生成图像 Prompt：

场景标题：${scene.title}
场景描述：${scene.description}
地点：${scene.location}
时间：${scene.time_of_day}
氛围：${scene.atmosphere}${characterDesc}

风格：anime, cinematic, detailed background, high quality`;

    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('生成场景 Prompt 失败:', error);
    // 返回默认 Prompt
    return {
      positive: `${scene.description}, ${scene.location}, ${scene.time_of_day}, ${scene.atmosphere}, anime style, detailed background, cinematic, high quality, masterpiece`,
      negative: 'lowres, bad quality, blurry, text, watermark, signature, cropped, worst quality, low quality, normal quality, jpeg artifacts',
    };
  }
}

/**
 * 生成动画 Prompt（给视频生成工具使用）
 */
async function generateAnimationPrompt(scene, imageUrl, targetPlatform = 'runway') {
  try {
    const { client, model } = getAIClient();
    const systemPrompt = `你是一个专业的视频生成 Prompt 工程师，擅长为 AI 视频生成工具创建 Prompt。

根据不同平台的特点：
- Runway Gen-2: 注重运镜和动作描述，简洁明了
- Pika: 支持详细的动作和效果描述
- AnimateDiff: 注重动画风格和过渡效果

返回 JSON 格式：
{
  "prompt": "动画 Prompt",
  "cameraMovement": "镜头运动描述",
  "duration": 建议时长（秒），
  "parameters": {
    "motion": "运动强度 (1-10)",
    "other": "其他参数"
  }
}`;

    const userPrompt = `请为以下场景生成适合 ${targetPlatform} 的视频生成 Prompt：

场景描述：${scene.description}
氛围：${scene.atmosphere}
时间：${scene.time_of_day}

要求：
1. 描述镜头运动（推、拉、摇、移、跟等）
2. 描述场景中的动态元素
3. 描述过渡效果
4. 保持动画风格一致`;

    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('生成动画 Prompt 失败:', error);
    return {
      prompt: `Camera slowly pans across the scene, ${scene.description}, anime style, smooth motion`,
      cameraMovement: 'slow pan',
      duration: 5,
      parameters: {
        motion: 5,
      },
    };
  }
}

module.exports = {
  generateCharacterPrompt,
  generateScenePrompt,
  generateAnimationPrompt,
};
