const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../novel2anime.db');
const db = new Database(dbPath);

console.log('✓ SQLite database connected:', dbPath);

// 初始化数据库表
const initSchema = () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS novels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        word_count INTEGER,
        analyzed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        appearance TEXT,
        personality TEXT,
        role VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scenes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
        scene_number INTEGER NOT NULL,
        title VARCHAR(255),
        description TEXT,
        location VARCHAR(255),
        time_of_day VARCHAR(50),
        atmosphere TEXT,
        characters_involved TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS plot_segments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
        scene_id INTEGER REFERENCES scenes(id) ON DELETE CASCADE,
        sequence_number INTEGER NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS image_prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        reference_id INTEGER,
        reference_type VARCHAR(50),
        prompt TEXT NOT NULL,
        negative_prompt TEXT,
        style VARCHAR(100),
        parameters TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS uploaded_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
        image_prompt_id INTEGER REFERENCES image_prompts(id) ON DELETE SET NULL,
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size INTEGER,
        mime_type VARCHAR(100),
        width INTEGER,
        height INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS animation_prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
        scene_id INTEGER REFERENCES scenes(id) ON DELETE CASCADE,
        uploaded_image_id INTEGER REFERENCES uploaded_images(id) ON DELETE SET NULL,
        sequence_number INTEGER NOT NULL,
        prompt TEXT NOT NULL,
        camera_movement VARCHAR(100),
        duration_seconds INTEGER,
        target_platform VARCHAR(50),
        parameters TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const statements = schema.split(';').filter(s => s.trim());
  statements.forEach(statement => {
    if (statement.trim()) {
      try {
        db.prepare(statement).run();
      } catch (e) {
        // 忽略表已存在的错误
      }
    }
  });

  // 插入示例项目（如果不存在）
  try {
    const exists = db.prepare('SELECT 1 FROM projects WHERE id = 1').get();
    if (!exists) {
      db.prepare("INSERT INTO projects (id, title, description) VALUES (1, '示例项目', '这是一个示例项目，展示如何使用本系统')").run();
    }
  } catch (e) {
    // 忽略错误
  }

  console.log('✓ SQLite database schema initialized');
};

// 初始化
initSchema();

// 包装为类似 pg 的接口
module.exports = {
  query: (text, params = []) => {
    try {
      // 处理 PostgreSQL 风格的 $1, $2 参数
      let sqliteText = text;
      if (params && params.length > 0) {
        params.forEach((_, index) => {
          sqliteText = sqliteText.replace(new RegExp(`\\$${index + 1}`, 'g'), '?');
        });
      }

      // 处理 PostgreSQL 的 CURRENT_TIMESTAMP
      sqliteText = sqliteText.replace(/CURRENT_TIMESTAMP/g, "datetime('now')");

      // 判断是否是查询
      const upperText = text.trim().toUpperCase();

      if (upperText.startsWith('SELECT')) {
        const stmt = db.prepare(sqliteText);
        const rows = stmt.all(...params);
        return Promise.resolve({ rows });
      } else if (upperText.startsWith('INSERT') && text.includes('RETURNING')) {
        // 处理 INSERT ... RETURNING
        const parts = sqliteText.split(/RETURNING/i);
        const plainInsert = parts[0].trim();
        const stmt = db.prepare(plainInsert);
        const info = stmt.run(...params);

        // 获取刚插入的行
        const tableMatch = text.match(/INTO\s+(\w+)/i);
        if (tableMatch) {
          const tableName = tableMatch[1];
          const selectStmt = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
          const rows = selectStmt.all(info.lastInsertRowid);
          return Promise.resolve({ rows });
        }
        return Promise.resolve({ rows: [{ id: info.lastInsertRowid }] });
      } else if (upperText.startsWith('UPDATE') && text.includes('RETURNING')) {
        // 处理 UPDATE ... RETURNING
        const parts = sqliteText.split(/RETURNING/i);
        const plainUpdate = parts[0].trim();
        const stmt = db.prepare(plainUpdate);
        stmt.run(...params);

        // 获取更新后的行
        const tableMatch = text.match(/UPDATE\s+(\w+)/i);
        const whereMatch = text.match(/WHERE\s+id\s*=\s*\$(\d+)/i);

        if (tableMatch && whereMatch) {
          const tableName = tableMatch[1];
          const idParamIndex = parseInt(whereMatch[1]) - 1;
          const id = params[idParamIndex];
          const selectStmt = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
          const rows = selectStmt.all(id);
          return Promise.resolve({ rows });
        }
        return Promise.resolve({ rows: [] });
      } else {
        // 其他命令
        const stmt = db.prepare(sqliteText);
        stmt.run(...params);
        return Promise.resolve({ rows: [] });
      }
    } catch (error) {
      console.error('SQLite query error:', error);
      console.error('SQL:', text);
      console.error('Params:', params);
      return Promise.reject(error);
    }
  },
  pool: db,
};
