
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mestre_desafios_db'
};

const pool = mysql.createPool(dbConfig);

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

// --- ADMIN USERS MANAGEMENT ---

app.get('/api/admin/users', async (req, res) => {
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
    const { amount } = req.body; // Pode ser positivo ou negativo
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
app.listen(PORT, () => console.log(`Backend Mestre rodando na porta ${PORT}`));
