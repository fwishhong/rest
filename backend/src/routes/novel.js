const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const aiService = require('../services/aiService');

// 创建并分析小说
router.post('/analyze', [
  body('title').trim().notEmpty().withMessage('标题不能为空'),
  body('content').trim().notEmpty().withMessage('内容不能为空'),
  body('projectId').optional().isInt(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, projectId } = req.body;
    const wordCount = content.length;

    // 1. 保存小说文本
    const novelResult = await db.query(
      'INSERT INTO novels (project_id, title, content, word_count, analyzed) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [projectId || null, title, content, wordCount, 0]  // false -> 0 (SQLite 兼容)
    );
    const novel = novelResult.rows[0];

    // 2. AI 分析小说
    console.log('开始 AI 分析...');
    const analysis = await aiService.analyzeNovel(content);

    // 3. 保存角色
    const characters = [];
    for (const char of analysis.characters) {
      const charResult = await db.query(
        'INSERT INTO characters (novel_id, name, description, appearance, personality, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [novel.id, char.name, char.description, char.appearance, char.personality, char.role]
      );
      characters.push(charResult.rows[0]);
    }

    // 4. 保存场景
    const scenes = [];
    for (let i = 0; i < analysis.scenes.length; i++) {
      const scene = analysis.scenes[i];
      // 将数组转换为 JSON 字符串（兼容 SQLite）
      const charactersInvolved = Array.isArray(scene.characters)
        ? JSON.stringify(scene.characters)
        : scene.characters;

      const sceneResult = await db.query(
        'INSERT INTO scenes (novel_id, scene_number, title, description, location, time_of_day, atmosphere, characters_involved) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [novel.id, i + 1, scene.title, scene.description, scene.location, scene.timeOfDay, scene.atmosphere, charactersInvolved]
      );
      scenes.push(sceneResult.rows[0]);
    }

    // 5. 保存情节片段
    const plotSegments = [];
    for (const segment of analysis.plotSegments) {
      const segmentResult = await db.query(
        'INSERT INTO plot_segments (novel_id, scene_id, sequence_number, content, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [novel.id, segment.sceneId, segment.sequenceNumber, segment.content, segment.type]
      );
      plotSegments.push(segmentResult.rows[0]);
    }

    // 6. 更新小说为已分析
    await db.query('UPDATE novels SET analyzed = $1 WHERE id = $2', [1, novel.id]);  // true -> 1 (SQLite 兼容)

    res.json({
      success: true,
      data: {
        novel: { ...novel, analyzed: true },
        characters,
        scenes,
        plotSegments,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取小说详情
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const novelResult = await db.query('SELECT * FROM novels WHERE id = $1', [id]);
    if (novelResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: '小说不存在' });
    }

    const charactersResult = await db.query('SELECT * FROM characters WHERE novel_id = $1', [id]);
    const scenesResult = await db.query('SELECT * FROM scenes WHERE novel_id = $1 ORDER BY scene_number', [id]);
    const plotSegmentsResult = await db.query('SELECT * FROM plot_segments WHERE novel_id = $1 ORDER BY sequence_number', [id]);

    // 将 JSON 字符串转换回数组（兼容 SQLite）
    const scenes = scenesResult.rows.map(scene => ({
      ...scene,
      characters_involved: typeof scene.characters_involved === 'string'
        ? JSON.parse(scene.characters_involved)
        : scene.characters_involved
    }));

    res.json({
      success: true,
      data: {
        novel: novelResult.rows[0],
        characters: charactersResult.rows,
        scenes: scenes,
        plotSegments: plotSegmentsResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 获取所有小说列表
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM novels ORDER BY created_at DESC');
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
