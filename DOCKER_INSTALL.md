# Docker 和 Docker Compose 安装指南

## 检查系统

你的系统：Linux

## 方案 A：安装 Docker 和 Docker Compose（推荐）

### 1. 安装 Docker

#### Ubuntu/Debian 系统：

```bash
# 更新软件包
sudo apt-get update

# 安装依赖
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加 Docker 官方 GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 添加 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户加入 docker 组（避免每次使用 sudo）
sudo usermod -aG docker $USER

# 重新登录或运行（使组权限生效）
newgrp docker

# 验证安装
docker --version
docker compose version
```

#### CentOS/RHEL 系统：

```bash
# 安装依赖
sudo yum install -y yum-utils

# 添加 Docker 仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户加入 docker 组
sudo usermod -aG docker $USER
newgrp docker

# 验证安装
docker --version
docker compose version
```

### 2. 使用 Docker Compose V2

新版 Docker 使用 `docker compose`（空格）而不是 `docker-compose`（连字符）：

```bash
# V2 命令（推荐）
docker compose up -d
docker compose down
docker compose logs

# 如果你习惯 V1 的 docker-compose，可以创建别名
echo 'alias docker-compose="docker compose"' >> ~/.bashrc
source ~/.bashrc
```

---

## 方案 B：不使用 Docker，直接安装 PostgreSQL（简单快速）

如果你不想安装 Docker，可以直接使用本地 PostgreSQL：

### 1. 安装 PostgreSQL

#### Ubuntu/Debian：
```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
```

#### CentOS/RHEL：
```bash
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. 创建数据库和用户

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 在 psql 中执行：
CREATE DATABASE novel2anime;
CREATE USER postgres WITH PASSWORD 'postgres123';
GRANT ALL PRIVILEGES ON DATABASE novel2anime TO postgres;
\q
```

### 3. 配置 PostgreSQL 允许本地连接

编辑 `/etc/postgresql/*/main/pg_hba.conf`（路径可能不同）：

```bash
# 找到这一行：
# local   all             postgres                                peer

# 改为：
local   all             postgres                                md5

# 或添加：
host    all             all             127.0.0.1/32            md5
```

重启 PostgreSQL：
```bash
sudo systemctl restart postgresql
```

### 4. 初始化数据库表

```bash
cd /home/user/rest/backend
psql -U postgres -d novel2anime -h localhost < src/db/schema.sql
# 输入密码：postgres123
```

### 5. 更新 `.env` 文件

确保数据库配置正确：
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=novel2anime
DB_USER=postgres
DB_PASSWORD=postgres123
```

---

## 快速对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| Docker | 隔离性好，易于清理，跨平台 | 需要安装 Docker |
| 本地 PostgreSQL | 安装简单，性能好 | 需要手动管理 |

---

## 验证数据库连接

安装完成后，测试连接：

```bash
# 方案 A (Docker)
docker compose ps

# 方案 B (本地 PostgreSQL)
psql -U postgres -d novel2anime -h localhost -c "SELECT version();"
```

---

## 快速启动（两种方案）

### 使用 Docker：
```bash
docker compose up -d
cd backend && npm install && npm run dev
```

### 使用本地 PostgreSQL：
```bash
# 确保 PostgreSQL 正在运行
sudo systemctl status postgresql
cd backend && npm install && npm run dev
```
