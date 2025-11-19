const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const promptGenerator = require('../services/promptGenerator');

// 生成图像 Prompt
router.post('/generate', [
  body('novelId').isInt().withMessage('小说ID必须是整数'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { novelId } = req.body;

    // 获取小说数据
    const novelResult = await db.query('SELECT * FROM novels WHERE id = $1', [novelId]);
    if (novelResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: '小说不存在' });
    }

    const charactersResult = await db.query('SELECT * FROM characters WHERE novel_id = $1', [novelId]);
    const scenesResult = await db.query('SELECT * FROM scenes WHERE novel_id = $1 ORDER BY scene_number', [novelId]);

    const characters = charactersResult.rows;
    // 将 JSON 字符串转换回数组（兼容 SQLite）
    const scenes = scenesResult.rows.map(scene => ({
      ...scene,
      characters_involved: typeof scene.characters_involved === 'string'
        ? JSON.parse(scene.characters_involved)
        : scene.characters_involved
    }));

    // 生成角色 Prompt
    const characterPrompts = [];
    for (const character of characters) {
      const prompt = await promptGenerator.generateCharacterPrompt(character);
      const result = await db.query(
        'INSERT INTO image_prompts (novel_id, type, reference_id, reference_type, prompt, negative_prompt, style) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [novelId, 'character', character.id, 'character', prompt.positive, prompt.negative, 'anime']
      );
      characterPrompts.push(result.rows[0]);
    }

    // 生成场景 Prompt
    const scenePrompts = [];
    for (const scene of scenes) {
      const prompt = await promptGenerator.generateScenePrompt(scene, characters);
      const result = await db.query(
        'INSERT INTO image_prompts (novel_id, type, reference_id, reference_type, prompt, negative_prompt, style) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [novelId, 'scene', scene.id, 'scene', prompt.positive, prompt.negative, 'anime']
      );
      scenePrompts.push(result.rows[0]);
    }

    res.json({
      success: true,
      data: {
        characterPrompts,
        scenePrompts,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取小说的所有 Prompt
router.get('/:novelId', async (req, res, next) => {
  try {
    const { novelId } = req.params;

    const result = await db.query(
      'SELECT * FROM image_prompts WHERE novel_id = $1 ORDER BY created_at',
      [novelId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// 更新 Prompt
router.put('/:id', [
  body('prompt').optional().trim(),
  body('negativePrompt').optional().trim(),
], async (req, res, next) => {
  try {
    const { id } = req.params;
    const { prompt, negativePrompt } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (prompt !== undefined) {
      updates.push(`prompt = $${paramIndex++}`);
      values.push(prompt);
    }
    if (negativePrompt !== undefined) {
      updates.push(`negative_prompt = $${paramIndex++}`);
      values.push(negativePrompt);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: '没有要更新的内容' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE image_prompts SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Prompt 不存在' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
