
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Aumentar o limite para suportar o payload grande dos desafios de 21 dias
app.use(express.json({ limit: '50mb' }));
app.use(cors());

const dbConfig = {
    host: '72.60.136.59',
    user: 'root',
    password: 'Al#!9th18',
    database: 'mestredesafios',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000 
};

let pool;

const connectDB = async () => {
  try {
    pool = mysql.createPool(dbConfig);
    await pool.execute('SELECT 1');
    console.log('✅ [DATABASE] Conectado ao MySQL.');
  } catch (err) {
    console.error('❌ [DATABASE] Erro de Conexão:', err.message);
  }
};

connectDB();

const ensureDb = (req, res, next) => {
  if (!pool) return res.status(503).json({ error: 'Banco de dados não inicializado.' });
  next();
};

const mapUser = (u) => {
    if (!u) return null;
    let branding = null;
    try {
        branding = u.branding_json ? JSON.parse(u.branding_json) : null;
    } catch (e) { branding = null; }

    return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        instagram: u.instagram,
        role: u.role,
        credits: u.credits,
        generationsCount: u.generations_count || 0,
        notificationsEnabled: !!u.notifications_enabled,
        isBlocked: !!u.is_blocked,
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=fe7501&color=fff`,
        branding: branding,
        created_at: u.created_at
    };
};

// Rota de Health Check para o Traefik/Docker
app.get('/api/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.post('/api/register', ensureDb, async (req, res) => {
    const user = req.body;
    console.log(`[API] Registrando: ${user.email}`);
    try {
        await pool.execute(
            `INSERT INTO users 
            (id, name, email, phone, instagram, role, credits, generations_count, branding_json, notifications_enabled, is_blocked, avatar) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
            name=VALUES(name), phone=VALUES(phone), instagram=VALUES(instagram), branding_json=VALUES(branding_json), avatar=VALUES(avatar)`,
            [
                user.id, user.name, user.email, user.phone || null, user.instagram || null, 
                user.role || 'MENTOR', user.credits || 3, user.generationsCount || 0,
                JSON.stringify(user.branding || {}),
                user.notificationsEnabled ? 1 : 0, user.isBlocked ? 1 : 0, user.avatar || null
            ]
        );
        res.status(201).json(user);
    } catch (error) {
        console.error('❌ [API] Falha no MySQL:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', ensureDb, async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            res.json(mapUser(rows[0]));
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro interno no login' });
    }
});

app.get('/api/plans/:mentorId', ensureDb, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM plans WHERE mentor_id = ? ORDER BY created_at DESC LIMIT 1', [req.params.mentorId]);
        if (rows.length > 0) {
            const plan = rows[0];
            res.json({
                ...plan,
                selectedAreas: JSON.parse(plan.selected_areas || '[]'),
                transformationMapping: JSON.parse(plan.transformation_mapping_json || '{}'),
                challenges: JSON.parse(plan.challenges_json || '[]')
            });
        } else {
            res.status(404).json({ error: 'Nenhum plano encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/plans', ensureDb, async (req, res) => {
    const plan = req.body;
    try {
        await pool.execute(
            `INSERT INTO plans 
            (id, mentor_id, student_name, plan_title, plan_description, niche, selected_areas, transformation_mapping_json, challenges_json, is_group_plan, is_full_version) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                plan.id, plan.mentorId, plan.studentName, plan.planTitle, plan.planDescription, plan.niche, 
                JSON.stringify(plan.selectedAreas), JSON.stringify(plan.transformationMapping), 
                JSON.stringify(plan.challenges), plan.isGroupPlan, plan.isFullVersion
            ]
        );
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('❌ [API] Erro ao salvar plano:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Outras rotas (tenants, admin, etc...)
app.get('/api/tenants/:slug', ensureDb, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM tenants WHERE slug = ?', [req.params.slug]);
        if (rows.length > 0) {
            const t = rows[0];
            res.json({ slug: t.slug, branding: JSON.parse(t.branding_json), landing: JSON.parse(t.landing_json) });
        } else { res.status(404).json({ error: 'Not found' }); }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// MANIPULAÇÃO DE ROTAS PARA SPA (Single Page Application)
app.get('*', (req, res) => {
    // Se a requisição for para /api e chegou aqui, significa que a rota não existe no Express
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ 
            error: `API Route Not Found: ${req.method} ${req.path}`,
            hint: 'Verifique se o backend está rodando e se a rota está registrada no server.ts'
        });
    }
    // Caso contrário, serve o index.html para o React handle o roteamento
    res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 MESTRE API RODANDO NA PORTA ${PORT}`);
    console.log(`🔗 Verifique em: http://localhost:${PORT}/api/health`);
});
