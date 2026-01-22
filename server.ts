
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
    // Teste de query simples para validar permissões e conexão
    const [rows] = await pool.execute('SELECT 1 + 1 AS result');
    console.log('✅ [DATABASE] MySQL conectado com sucesso em 72.60.136.59');
    console.log('📊 [DATABASE] Teste de query (1+1):', (rows as any)[0].result);
  } catch (err: any) {
    console.error('❌ [DATABASE] ERRO CRÍTICO DE CONEXÃO:', err.message);
    console.error('Verifique as regras de firewall do servidor 72.60.136.59 e se o usuário root tem permissão de acesso remoto.');
  }
};

connectDB();

const ensureDb = (req: any, res: any, next: any) => {
  if (!pool) return res.status(503).json({ error: 'Banco de dados não inicializado ou offline.' });
  next();
};

// Rota de Diagnóstico
app.get('/api/health', async (req, res) => {
    try {
        await pool.execute('SELECT 1');
        res.json({ status: 'online', database: 'connected', timestamp: new Date() });
    } catch (e: any) {
        res.status(500).json({ status: 'error', database: e.message });
    }
});

// --- API: USUÁRIOS ---
app.post('/api/login', ensureDb, async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            const user = rows[0];
            try {
                if (user.branding_json) user.branding = JSON.parse(user.branding_json);
            } catch (e) { user.branding = null; }
            res.json(user);
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
        await pool.execute(
            'INSERT INTO users (id, name, email, phone, instagram, role, credits, branding_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), branding_json=VALUES(branding_json)',
            [user.id, user.name, user.email, user.phone, user.instagram, user.role, user.credits, JSON.stringify(user.branding || {})]
        );
        res.status(201).json(user);
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro ao registrar no banco de dados' });
    }
});

app.get('/api/admin/users', ensureDb, async (req, res) => {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
        // Sanitização dos dados JSON antes de enviar ao front
        const users = rows.map((u: any) => {
            try {
                u.branding = u.branding_json ? JSON.parse(u.branding_json) : null;
            } catch (e) { u.branding = null; }
            delete u.password; // Segurança: nunca enviar a senha
            return u;
        });
        res.json(users);
    } catch (error: any) {
        console.error('Erro ao buscar usuários:', error.message);
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
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
    res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n🚀 SERVIDOR UNIFICADO ATIVO: http://localhost:${PORT}\n`);
});
