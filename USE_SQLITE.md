# 使用 SQLite 替代 PostgreSQL（最简单方案）

如果你遇到 PostgreSQL 安装或权限问题，可以使用 SQLite 作为轻量级替代方案。

## 为什么选择 SQLite？

- ✅ 无需安装服务
- ✅ 无需配置权限
- ✅ 零配置，开箱即用
- ✅ 完美适合开发和测试
- ⚠️ 不适合生产环境的高并发场景

## 快速切换到 SQLite

### 1. 安装依赖

```bash
cd backend
npm install sqlite3 better-sqlite3
```

### 2. 创建 SQLite 数据库配置

创建 `backend/src/db/database-sqlite.js`：

```javascript
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../novel2anime.db');
const db = new Database(dbPath);

console.log('✓ SQLite database connected:', dbPath);

// 初始化数据库表
const initSchema = () => {
  const schema = `
    -- 项目表
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 小说文本表
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

    -- 角色表
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

    -- 场景表
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

    -- 情节/剧情片段表
    CREATE TABLE IF NOT EXISTS plot_segments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
        scene_id INTEGER REFERENCES scenes(id) ON DELETE CASCADE,
        sequence_number INTEGER NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 图像 Prompt 表
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

    -- 上传图像表
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

    -- 动画 Prompt 表
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

    -- 插入示例项目
    INSERT OR IGNORE INTO projects (id, title, description) VALUES
    (1, '示例项目', '这是一个示例项目，展示如何使用本系统');
  `;

  const statements = schema.split(';').filter(s => s.trim());
  statements.forEach(statement => {
    if (statement.trim()) {
      db.prepare(statement).run();
    }
  });

  console.log('✓ Database schema initialized');
};

// 初始化
initSchema();

// 包装为类似 pg 的接口
module.exports = {
  query: (text, params) => {
    try {
      const stmt = db.prepare(text);

      // 处理 PostgreSQL 风格的 $1, $2 参数
      let sqliteText = text;
      if (params && params.length > 0) {
        params.forEach((_, index) => {
          sqliteText = sqliteText.replace(`$${index + 1}`, '?');
        });
      }

      const sqliteStmt = db.prepare(sqliteText);

      // 判断是否是查询
      if (text.trim().toUpperCase().startsWith('SELECT')) {
        const rows = sqliteStmt.all(...(params || []));
        return Promise.resolve({ rows });
      } else if (text.trim().toUpperCase().startsWith('INSERT') && text.includes('RETURNING')) {
        // 处理 INSERT ... RETURNING
        const plainInsert = sqliteText.split('RETURNING')[0].trim();
        const stmt = db.prepare(plainInsert);
        const info = stmt.run(...(params || []));

        // 获取刚插入的行
        const selectStmt = db.prepare(`SELECT * FROM ${text.match(/INTO\s+(\w+)/i)[1]} WHERE id = ?`);
        const rows = selectStmt.all(info.lastInsertRowid);
        return Promise.resolve({ rows });
      } else if (text.trim().toUpperCase().startsWith('UPDATE') && text.includes('RETURNING')) {
        // 处理 UPDATE ... RETURNING
        const parts = sqliteText.split('RETURNING');
        const plainUpdate = parts[0].trim();
        const stmt = db.prepare(plainUpdate);
        stmt.run(...(params || []));

        // 获取更新后的行
        const idMatch = text.match(/WHERE\s+id\s*=\s*\$(\d+)/i);
        if (idMatch) {
          const idParamIndex = parseInt(idMatch[1]) - 1;
          const id = params[idParamIndex];
          const tableName = text.match(/UPDATE\s+(\w+)/i)[1];
          const selectStmt = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
          const rows = selectStmt.all(id);
          return Promise.resolve({ rows });
        }
        return Promise.resolve({ rows: [] });
      } else {
        // 其他命令
        sqliteStmt.run(...(params || []));
        return Promise.resolve({ rows: [] });
      }
    } catch (error) {
      return Promise.reject(error);
    }
  },
  pool: db,
};
```

### 3. 修改 `.env`

注释掉 PostgreSQL 配置，添加 SQLite 标志：

```bash
# 使用 SQLite
USE_SQLITE=true

# PostgreSQL (暂时不用)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=novel2anime
# DB_USER=postgres
# DB_PASSWORD=postgres123
```

### 4. 修改数据库连接文件

编辑 `backend/src/db/database.js`，在开头添加：

```javascript
// 检查是否使用 SQLite
if (process.env.USE_SQLITE === 'true') {
  console.log('Using SQLite database');
  module.exports = require('./database-sqlite');
  return;
}

// 原有的 PostgreSQL 代码保持不变
const { Pool } = require('pg');
// ... 其余代码
```

### 5. 启动后端

```bash
cd backend
npm install
npm run dev
```

就这么简单！数据库文件会自动创建在 `backend/novel2anime.db`。

## 数据库文件位置

- SQLite 数据库文件：`backend/novel2anime.db`
- 查看数据：`sqlite3 backend/novel2anime.db "SELECT * FROM novels;"`
- 备份：直接复制 `novel2anime.db` 文件即可

## 后续升级到 PostgreSQL

当你想切换回 PostgreSQL 时：

1. 安装并启动 PostgreSQL
2. 修改 `.env`：`USE_SQLITE=false`
3. 重启后端

数据不会自动迁移，需要手动导出导入。

## 性能对比

对于本项目（单用户、轻量使用）：
- SQLite 性能完全够用
- 启动速度更快
- 零配置，零运维

对于生产环境（多用户、高并发）：
- 推荐 PostgreSQL
- 更好的并发支持
- 更强大的功能
