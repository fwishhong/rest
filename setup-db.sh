#!/bin/bash

# 小说转动画工作流 - 数据库快速设置脚本

set -e

echo "=========================================="
echo "  小说转动画工作流 - 数据库设置"
echo "=========================================="
echo ""

DB_NAME="novel2anime"
DB_USER="postgres"
DB_PASSWORD="postgres123"

# 检查 PostgreSQL 是否运行
echo "1. 检查 PostgreSQL 状态..."
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL 未运行，尝试启动..."
    sudo systemctl start postgresql || {
        echo "❌ 无法启动 PostgreSQL，请手动启动：sudo systemctl start postgresql"
        exit 1
    }
fi
echo "✓ PostgreSQL 正在运行"
echo ""

# 创建数据库（如果不存在）
echo "2. 创建数据库..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" && \
echo "✓ 数据库 $DB_NAME 已创建" || \
echo "✓ 数据库 $DB_NAME 已存在"
echo ""

# 设置用户密码
echo "3. 配置数据库用户..."
sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" && \
echo "✓ 用户密码已设置" || \
echo "⚠️  用户配置可能失败"
echo ""

# 导入数据库结构
echo "4. 初始化数据库表..."
sudo -u postgres psql -d $DB_NAME -f backend/src/db/schema.sql && \
echo "✓ 数据库表已创建" || \
echo "⚠️  表可能已存在或创建失败"
echo ""

# 配置 pg_hba.conf 允许密码登录
echo "5. 配置数据库连接权限..."
PG_HBA=$(sudo -u postgres psql -t -P format=unaligned -c 'SHOW hba_file')
if ! sudo grep -q "host.*all.*all.*127.0.0.1/32.*md5" "$PG_HBA"; then
    echo "host    all             all             127.0.0.1/32            md5" | sudo tee -a "$PG_HBA" > /dev/null
    sudo systemctl reload postgresql
    echo "✓ 已添加本地连接权限"
else
    echo "✓ 连接权限已配置"
fi
echo ""

# 测试连接
echo "6. 测试数据库连接..."
if PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -h localhost -c "SELECT 1" > /dev/null 2>&1; then
    echo "✓ 数据库连接成功！"
else
    echo "⚠️  数据库连接失败，请检查配置"
    echo ""
    echo "手动测试命令："
    echo "  PGPASSWORD=postgres123 psql -U postgres -d novel2anime -h localhost"
fi
echo ""

# 显示数据库信息
echo "=========================================="
echo "  数据库设置完成！"
echo "=========================================="
echo ""
echo "数据库信息："
echo "  主机: localhost"
echo "  端口: 5432"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
echo "  密码: $DB_PASSWORD"
echo ""
echo "下一步："
echo "  1. 确认 .env 文件中的数据库配置正确"
echo "  2. 启动后端：cd backend && npm install && npm run dev"
echo "  3. 启动前端：cd frontend && npm install && npm run dev"
echo ""
echo "如果遇到连接问题，请查看 DOCKER_INSTALL.md 中的方案 B"
echo ""
