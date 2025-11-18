require('dotenv').config({ path: '../../.env' });

// 检查是否使用 SQLite
if (process.env.USE_SQLITE === 'true') {
  console.log('Using SQLite database');
  module.exports = require('./database-sqlite');
} else {
  // 使用 PostgreSQL
  const { Pool } = require('pg');

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'novel2anime',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
  });

  // 测试数据库连接
  pool.on('connect', () => {
    console.log('✓ PostgreSQL database connected');
  });

  pool.on('error', (err) => {
    console.error('Database error:', err);
    process.exit(-1);
  });

  module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
  };
}
