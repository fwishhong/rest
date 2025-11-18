const { getAIClient } = require('./aiClient');

/**
 * 分析小说文本，提取角色、场景、情节
 */
async function analyzeNovel(content) {
  try {
    const { client, model } = getAIClient();
    const prompt = `你是一个专业的小说分析助手。请详细分析以下小说文本，提取关键信息。

小说内容：
${content}

请按照以下 JSON 格式返回分析结果：

{
  "characters": [
    {
      "name": "角色名称",
      "description": "角色简介",
      "appearance": "外貌描述（详细，包括发型、服装、身材、特征等）",
      "personality": "性格特点",
      "role": "主角/配角/反派"
    }
  ],
  "scenes": [
    {
      "title": "场景标题",
      "description": "场景详细描述",
      "location": "地点",
      "timeOfDay": "时间（早晨/中午/傍晚/夜晚等）",
      "atmosphere": "氛围描述（明亮/阴暗/温馨/紧张等）",
      "characters": ["参与的角色名称列表"]
    }
  ],
  "plotSegments": [
    {
      "sceneId": null,
      "sequenceNumber": 1,
      "content": "情节内容",
      "type": "对话/叙述/动作"
    }
  ]
}

要求：
1. 角色的外貌描述要非常详细，包括所有视觉特征
2. 场景描述要包含环境、光线、氛围等细节
3. 尽可能提取所有主要角色和重要场景
4. 按照故事发生顺序组织场景
5. 只返回 JSON，不要有其他文字`;

    const response = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的小说分析助手，擅长提取角色、场景和情节信息。请严格按照 JSON 格式返回结果。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content);

    // 验证和标准化数据
    const characters = result.characters || [];
    const scenes = result.scenes || [];
    const plotSegments = result.plotSegments || [];

    return {
      characters,
      scenes,
      plotSegments,
    };
  } catch (error) {
    console.error('AI 分析失败:', error);
    throw new Error('AI 分析失败: ' + error.message);
  }
}

module.exports = {
  analyzeNovel,
};
