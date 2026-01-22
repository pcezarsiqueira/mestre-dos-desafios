
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Configurações do Banco de Dados fornecidas pelo usuário
const dbConfig = {
    host: '72.60.136.5',
    user: 'root',
    password: 'Al#!9th18',
    database: 'mestredesafios',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Criando o pool de conexão com tratamento de erro inicial
let pool: mysql.Pool;
try {
  pool = mysql.createPool(dbConfig);
  console.log('Pool de conexão MySQL configurado para 72.60.136.5');
} catch (err) {
  console.error('Erro ao criar pool de conexão:', err);
}

// Middleware para verificar se a conexão com o DB está ativa
const checkDb = async (req: any, res: any, next: any) => {
  try {
    const conn = await pool.getConnection();
    conn.release();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Banco de dados inacessível no momento.' });
  }
};

// --- AUTH ---

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            if (rows[0].is_blocked) {
                return res.status(403).json({ error: 'Sua conta foi bloqueada. Entre em contato com o suporte.' });
            }
            res.json(rows[0]);
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

app.post('/api/register', async (req, res) => {
    const user = req.body;
    try {
        await pool.execute(
            'INSERT INTO users (id, name, email, phone, instagram, role, credits, branding_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [user.id, user.name, user.email, user.phone, user.instagram, user.role, user.credits, JSON.stringify(user.branding)]
        );
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
});

// --- ADMIN USERS MANAGEMENT ---

app.get('/api/admin/users', checkDb, async (req, res) => {
    try {
        const [rows]: any = await pool.execute('SELECT id, name, email, role, credits, is_blocked, total_spent, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

app.put('/api/admin/users/:id', async (req, res) => {
    const { name, email, role, password } = req.body;
    try {
        if (password) {
            await pool.execute(
                'UPDATE users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?',
                [name, email, role, password, req.params.id]
            );
        } else {
            await pool.execute(
                'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
                [name, email, role, req.params.id]
            );
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

app.post('/api/admin/users/:id/credits', async (req, res) => {
    const { amount } = req.body;
    try {
        await pool.execute('UPDATE users SET credits = credits + ? WHERE id = ?', [amount, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar créditos' });
    }
});

app.patch('/api/admin/users/:id/block', async (req, res) => {
    const { is_blocked } = req.body;
    try {
        await pool.execute('UPDATE users SET is_blocked = ? WHERE id = ?', [is_blocked, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alterar status de bloqueio' });
    }
});

app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover usuário' });
    }
});

// --- TENANTS & PLANS ---

app.get('/api/tenants/:slug', async (req, res) => {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM tenants WHERE slug = ? AND is_active = 1', [req.params.slug]);
        if (rows.length > 0) {
            const tenant = rows[0];
            res.json({
                slug: tenant.slug,
                branding: JSON.parse(tenant.branding_json),
                landing: JSON.parse(tenant.landing_json)
            });
        } else {
            res.status(404).json({ error: 'Tenant não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar tenant' });
    }
});

app.post('/api/tenants', async (req, res) => {
    const { slug, mentorId, branding, landing } = req.body;
    try {
        const [existing]: any = await pool.execute('SELECT mentor_id FROM tenants WHERE slug = ?', [slug]);
        if (existing.length > 0 && existing[0].mentor_id !== mentorId) {
            return res.status(400).json({ error: 'Este subdomínio já está em uso.' });
        }
        await pool.execute(
            'INSERT INTO tenants (slug, mentor_id, branding_json, landing_json) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE branding_json = ?, landing_json = ?',
            [slug, mentorId, JSON.stringify(branding), JSON.stringify(landing), JSON.stringify(branding), JSON.stringify(landing)]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao configurar subdomínio' });
    }
});

const PORT = process.env.PORT || 3001;
// Ouvindo em 0.0.0.0 para permitir acesso externo
app.listen(PORT, () => {
    console.log(`Backend Mestre rodando na porta ${PORT}`);
    console.log(`Conectado ao MySQL em 72.60.136.5`);
});
