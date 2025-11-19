const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const promptGenerator = require('../services/promptGenerator');

// 生成动画 Prompt
router.post('/generate', [
  body('imageId').isInt().withMessage('imageId 必须是整数'),
  body('targetPlatform').optional().isString(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { imageId, targetPlatform = 'runway' } = req.body;

    // 获取图片信息
    const imageResult = await db.query('SELECT * FROM uploaded_images WHERE id = $1', [imageId]);
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: '图片不存在' });
    }

    const image = imageResult.rows[0];
    const novelId = image.novel_id;

    // 获取关联的场景
    const sceneResult = await db.query(
      `SELECT s.* FROM scenes s
       JOIN image_prompts ip ON s.id = ip.reference_id
       WHERE ip.id = $1 AND ip.reference_type = 'scene'`,
      [image.image_prompt_id]
    );

    const scene = sceneResult.rows[0] || {};

    // 生成动画 Prompt
    const animPrompt = await promptGenerator.generateAnimationPrompt(scene, image.file_path, targetPlatform);

    // 保存到数据库
    const result = await db.query(
      `INSERT INTO animation_prompts
       (novel_id, scene_id, uploaded_image_id, sequence_number, prompt, camera_movement, duration_seconds, target_platform, parameters)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        novelId,
        scene.id || null,
        imageId,
        1,
        animPrompt.prompt,
        animPrompt.cameraMovement || 'none',
        animPrompt.duration || 5,
        targetPlatform,
        JSON.stringify(animPrompt.parameters || {})
      ]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 获取小说的所有动画 Prompt
router.get('/:novelId', async (req, res, next) => {
  try {
    const { novelId } = req.params;

    const result = await db.query(
      'SELECT * FROM animation_prompts WHERE novel_id = $1 ORDER BY created_at DESC',
      [novelId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// 更新动画 Prompt
router.put('/:id', [
  body('prompt').optional().trim(),
  body('cameraMovement').optional().trim(),
], async (req, res, next) => {
  try {
    const { id } = req.params;
    const { prompt, cameraMovement } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (prompt !== undefined) {
      updates.push(`prompt = $${paramIndex++}`);
      values.push(prompt);
    }
    if (cameraMovement !== undefined) {
      updates.push(`camera_movement = $${paramIndex++}`);
      values.push(cameraMovement);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: '没有要更新的内容' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE animation_prompts SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Prompt 不存在' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// 删除动画 Prompt
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM animation_prompts WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Prompt 已删除'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
