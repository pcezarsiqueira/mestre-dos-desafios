
-- Criação do Banco de Dados
CREATE DATABASE IF NOT EXISTS mestredesafios;
USE mestredesafios;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    instagram VARCHAR(100),
    role ENUM('MENTOR', 'STUDENT', 'ADMIN') DEFAULT 'MENTOR',
    credits INT DEFAULT 3,
    generations_count INT DEFAULT 0,
    branding_json TEXT, -- Usando TEXT para compatibilidade caso JSON não esteja ativo
    notifications_enabled BOOLEAN DEFAULT FALSE,
    password VARCHAR(255),
    is_blocked BOOLEAN DEFAULT FALSE,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuário Admin Padrão (Opcional para insert manual se necessário)
-- INSERT INTO users (id, name, email, role, credits, password) VALUES ('admin-001', 'Admin Mestre', 'admin@mestre.com', 'ADMIN', 999, 'mestre@123');

-- Tabela de Tenants (Configurações de Subdomínio)
CREATE TABLE IF NOT EXISTS tenants (
    slug VARCHAR(100) PRIMARY KEY,
    mentor_id VARCHAR(36) NOT NULL,
    branding_json TEXT,
    landing_json TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(36) PRIMARY KEY,
    mentor_id VARCHAR(36),
    student_name VARCHAR(255) NOT NULL,
    plan_title VARCHAR(255) NOT NULL,
    plan_description TEXT,
    niche VARCHAR(255),
    selected_areas TEXT,
    transformation_mapping_json TEXT,
    is_group_plan BOOLEAN DEFAULT FALSE,
    is_full_version BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
);
