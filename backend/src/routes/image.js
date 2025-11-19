const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db/database');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件！'));
    }
  }
});

// 上传图片
router.post('/upload', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '请选择图片文件' });
    }

    const { novelId, promptId } = req.body;

    if (!novelId) {
      return res.status(400).json({ success: false, error: '缺少 novelId 参数' });
    }

    const result = await db.query(
      `INSERT INTO uploaded_images (novel_id, image_prompt_id, file_path, file_name, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        novelId,
        promptId || null,
        req.file.path,
        req.file.filename,
        req.file.size,
        req.file.mimetype
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

// 获取小说的所有图片
router.get('/:novelId', async (req, res, next) => {
  try {
    const { novelId } = req.params;

    const result = await db.query(
      'SELECT * FROM uploaded_images WHERE novel_id = $1 ORDER BY created_at DESC',
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

// 删除图片
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // 获取图片信息
    const imageResult = await db.query('SELECT * FROM uploaded_images WHERE id = $1', [id]);
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: '图片不存在' });
    }

    // 删除文件
    const fs = require('fs');
    const filePath = imageResult.rows[0].file_path;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 删除数据库记录
    await db.query('DELETE FROM uploaded_images WHERE id = $1', [id]);

    res.json({
      success: true,
      message: '图片已删除'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
