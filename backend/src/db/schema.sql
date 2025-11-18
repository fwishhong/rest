-- 小说到动画工作流数据库结构

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 小说文本表
CREATE TABLE IF NOT EXISTS novels (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER,
    analyzed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    appearance TEXT,
    personality TEXT,
    role VARCHAR(50), -- 主角、配角、反派等
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 场景表
CREATE TABLE IF NOT EXISTS scenes (
    id SERIAL PRIMARY KEY,
    novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
    scene_number INTEGER NOT NULL,
    title VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    time_of_day VARCHAR(50),
    atmosphere TEXT,
    characters_involved TEXT[], -- 参与的角色名称数组
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 情节/剧情片段表
CREATE TABLE IF NOT EXISTS plot_segments (
    id SERIAL PRIMARY KEY,
    novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
    scene_id INTEGER REFERENCES scenes(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50), -- 对话、叙述、动作等
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 图像 Prompt 表
CREATE TABLE IF NOT EXISTS image_prompts (
    id SERIAL PRIMARY KEY,
    novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- character, scene, keyframe
    reference_id INTEGER, -- 关联的角色ID或场景ID
    reference_type VARCHAR(50), -- character, scene
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    style VARCHAR(100), -- 动漫、写实、水彩等
    parameters JSONB, -- 其他参数（尺寸、步数等）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 上传图像表
CREATE TABLE IF NOT EXISTS uploaded_images (
    id SERIAL PRIMARY KEY,
    novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
    image_prompt_id INTEGER REFERENCES image_prompts(id) ON DELETE SET NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 动画 Prompt 表
CREATE TABLE IF NOT EXISTS animation_prompts (
    id SERIAL PRIMARY KEY,
    novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
    scene_id INTEGER REFERENCES scenes(id) ON DELETE CASCADE,
    uploaded_image_id INTEGER REFERENCES uploaded_images(id) ON DELETE SET NULL,
    sequence_number INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    camera_movement VARCHAR(100), -- 推、拉、摇、移等
    duration_seconds INTEGER,
    target_platform VARCHAR(50), -- runway, pika, animatediff
    parameters JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_novels_project_id ON novels(project_id);
CREATE INDEX idx_characters_novel_id ON characters(novel_id);
CREATE INDEX idx_scenes_novel_id ON scenes(novel_id);
CREATE INDEX idx_plot_segments_novel_id ON plot_segments(novel_id);
CREATE INDEX idx_plot_segments_scene_id ON plot_segments(scene_id);
CREATE INDEX idx_image_prompts_novel_id ON image_prompts(novel_id);
CREATE INDEX idx_uploaded_images_novel_id ON uploaded_images(novel_id);
CREATE INDEX idx_animation_prompts_novel_id ON animation_prompts(novel_id);
CREATE INDEX idx_animation_prompts_scene_id ON animation_prompts(scene_id);

-- 插入示例项目
INSERT INTO projects (title, description) VALUES
('示例项目', '这是一个示例项目，展示如何使用本系统');
