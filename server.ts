
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
app.use(express.json());
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

let pool: mysql.Pool;

const connectDB = async () => {
  try {
    pool = mysql.createPool(dbConfig);
    const [rows] = await pool.execute('SELECT 1 + 1 AS result');
    console.log('✅ [DATABASE] MySQL conectado com sucesso em 72.60.136.59');
  } catch (err: any) {
    console.error('❌ [DATABASE] ERRO CRÍTICO DE CONEXÃO:', err.message);
  }
};

connectDB();

const ensureDb = (req: any, res: any, next: any) => {
  if (!pool) return res.status(503).json({ error: 'Banco de dados não inicializado ou offline.' });
  next();
};

// Mapeador de usuário para converter snake_case do SQL para camelCase do App
const mapUser = (u: any) => {
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

// --- API: USUÁRIOS ---
app.post('/api/login', ensureDb, async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            res.json(mapUser(rows[0]));
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor durante login' });
    }
});

app.post('/api/register', ensureDb, async (req, res) => {
    const user = req.body;
    try {
        // Alinhado com as colunas reais da tabela 'users' no MySQL
        await pool.execute(
            `INSERT INTO users 
            (id, name, email, phone, instagram, role, credits, generations_count, branding_json, notifications_enabled, is_blocked) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
            name=VALUES(name), phone=VALUES(phone), instagram=VALUES(instagram), branding_json=VALUES(branding_json)`,
            [
                user.id, 
                user.name, 
                user.email, 
                user.phone || null, 
                user.instagram || null, 
                user.role || 'MENTOR', 
                user.credits || 3, 
                user.generationsCount || 0,
                JSON.stringify(user.branding || {}),
                user.notificationsEnabled ? 1 : 0,
                user.isBlocked ? 1 : 0
            ]
        );
        res.status(201).json(user);
    } catch (error: any) {
        console.error('Erro no registro:', error.message);
        res.status(500).json({ error: 'Erro ao registrar no banco de dados' });
    }
});

app.get('/api/admin/users', ensureDb, async (req, res) => {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
        res.json(rows.map(mapUser));
    } catch (error: any) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

// --- API: TENANTS (SUBDOMÍNIOS) ---
app.get('/api/tenants/:slug', ensureDb, async (req, res) => {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM tenants WHERE slug = ?', [req.params.slug]);
        if (rows.length > 0) {
            const tenant = rows[0];
            res.json({
                slug: tenant.slug,
                branding: JSON.parse(tenant.branding_json || '{}'),
                landing: JSON.parse(tenant.landing_json || '{}')
            });
        } else {
            res.status(404).json({ error: 'Tenant não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar tenant' });
    }
});

app.post('/api/tenants', ensureDb, async (req, res) => {
    const { slug, mentorId, branding, landing } = req.body;
    try {
        await pool.execute(
            'INSERT INTO tenants (slug, mentor_id, branding_json, landing_json) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE branding_json=VALUES(branding_json), landing_json=VALUES(landing_json)',
            [slug, mentorId, JSON.stringify(branding || {}), JSON.stringify(landing || {})]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar tenant' });
    }
});

// --- API: PLANOS (JORNADAS) ---
app.get('/api/plans/:mentorId', ensureDb, async (req, res) => {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM plans WHERE mentor_id = ? ORDER BY created_at DESC LIMIT 1', [req.params.mentorId]);
        if (rows.length > 0) {
            const plan = rows[0];
            res.json({
                ...plan,
                selectedAreas: JSON.parse(plan.selected_areas || '[]'),
                transformationMapping: JSON.parse(plan.transformation_mapping_json || '{}'),
                challenges: JSON.parse(plan.challenges_json || '[]')
            });
        } else {
            res.status(404).json({ error: 'Plano não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar plano' });
    }
});

app.post('/api/plans', ensureDb, async (req, res) => {
    const plan = req.body;
    try {
        await pool.execute(
            'INSERT INTO plans (id, mentor_id, student_name, plan_title, plan_description, niche, selected_areas, transformation_mapping_json, challenges_json, is_group_plan, is_full_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [plan.id, plan.mentorId, plan.studentName, plan.planTitle, plan.planDescription, plan.niche, JSON.stringify(plan.selectedAreas), JSON.stringify(plan.transformationMapping), JSON.stringify(plan.challenges), plan.isGroupPlan, plan.isFullVersion]
        );
        res.status(201).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar plano' });
    }
});

// --- SERVINDO O FRONTEND ---
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
    // Se o Nginx não capturou /api, o Node captura aqui e avisa que a rota GET não existe
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Rota de API inexistente ou método incorreto' });
    res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n🚀 SERVIDOR UNIFICADO ATIVO: http://localhost:${PORT}\n`);
});
