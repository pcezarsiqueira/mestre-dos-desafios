
-- Tabela de Usuários (Experts e Admins)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    instagram VARCHAR(100),
    role ENUM('MENTOR', 'STUDENT', 'ADMIN') DEFAULT 'MENTOR',
    credits INT DEFAULT 3,
    generations_count INT DEFAULT 0,
    branding_json JSON, -- Armazena cores, logo e nomes
    notifications_enabled BOOLEAN DEFAULT FALSE,
    password VARCHAR(255),
    is_blocked BOOLEAN DEFAULT FALSE,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tenants (Configurações de Subdomínio)
CREATE TABLE IF NOT EXISTS tenants (
    slug VARCHAR(100) PRIMARY KEY,
    mentor_id VARCHAR(36) NOT NULL,
    branding_json JSON,
    landing_json JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Planos (As Jornadas de 21 dias)
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(36) PRIMARY KEY,
    mentor_id VARCHAR(36),
    student_name VARCHAR(255) NOT NULL,
    plan_title VARCHAR(255) NOT NULL,
    plan_description TEXT,
    niche VARCHAR(255),
    selected_areas JSON, -- Array de HealthArea
    transformation_mapping_json JSON,
    is_group_plan BOOLEAN DEFAULT FALSE,
    is_full_version BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Desafios (Os dias da jornada)
CREATE TABLE IF NOT EXISTS challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id VARCHAR(36),
    day INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    objective TEXT,
    instructions_json JSON,
    estimated_time VARCHAR(50),
    style_notes TEXT,
    health_area_weights_json JSON,
    xp INT DEFAULT 100,
    is_fire_trial BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);
