
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Configurações do Banco de Dados Remoto (72.60.136.5)
const dbConfig = {
    host: '72.60.136.5',
    user: 'root',
    password: 'Al#!9th18',
    database: 'mestredesafios',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 // 10 segundos para timeout de conexão
};

// Criando o pool de conexão
let pool: mysql.Pool;

const connectDB = async () => {
  try {
    pool = mysql.createPool(dbConfig);
    // Testa a conexão imediatamente
    const connection = await pool.getConnection();
    console.log('✅ [MySQL] Conectado com sucesso ao servidor 72.60.136.5');
    connection.release();
  } catch (err) {
    console.error('❌ [MySQL] Erro crítico de conexão:', err);
    console.log('Verifique se o IP 72.60.136.5 permite conexões externas para o usuário root.');
  }
};

connectDB();

// Middleware para validar se o pool existe antes das rotas
const ensureDb = (req: any, res: any, next: any) => {
  if (!pool) return res.status(503).json({ error: 'Serviço de banco de dados não inicializado.' });
  next();
};

// --- ROTAS DA API ---

// Teste de Sanidade
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Mestre dos Desafios está online' });
});

app.post('/api/login', ensureDb, async (req, res) => {
    const { email, password } = req.body;
    console.log(`[Auth] Tentativa de login para: ${email}`);
    try {
        const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            const user = rows[0];
            if (user.is_blocked) {
                return res.status(403).json({ error: 'Conta bloqueada.' });
            }
            // Parse branding se existir
            if (user.branding_json && typeof user.branding_json === 'string') {
              user.branding = JSON.parse(user.branding_json);
            }
            res.json(user);
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ error: 'Erro interno no servidor de autenticação' });
    }
});

app.post('/api/register', ensureDb, async (req, res) => {
    const user = req.body;
    try {
        await pool.execute(
            'INSERT INTO users (id, name, email, phone, instagram, role, credits, branding_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [user.id, user.name, user.email, user.phone, user.instagram, user.role, user.credits, JSON.stringify(user.branding)]
        );
        res.status(201).json(user);
    } catch (error) {
        console.error('[Register Error]', error);
        res.status(500).json({ error: 'Erro ao registrar usuário no MySQL' });
    }
});

app.get('/api/admin/users', ensureDb, async (req, res) => {
    try {
        const [rows]: any = await pool.execute('SELECT id, name, email, role, credits, is_blocked, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('[Admin Error]', error);
        res.status(500).json({ error: 'Falha ao buscar lista de usuários' });
    }
});

// Salvar/Atualizar Tenant (Subdomínio)
app.post('/api/tenants', ensureDb, async (req, res) => {
    const { slug, mentorId, branding, landing } = req.body;
    try {
        await pool.execute(
            'INSERT INTO tenants (slug, mentor_id, branding_json, landing_json) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE branding_json = ?, landing_json = ?',
            [slug, mentorId, JSON.stringify(branding), JSON.stringify(landing), JSON.stringify(branding), JSON.stringify(landing)]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('[Tenant Error]', error);
        res.status(500).json({ error: 'Erro ao salvar configuração de subdomínio' });
    }
});

app.get('/api/tenants/:slug', ensureDb, async (req, res) => {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM tenants WHERE slug = ?', [req.params.slug]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Tenant não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar subdomínio' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Backend] Mestre dos Desafios rodando na porta ${PORT}`);
    console.log(`📡 [API URL] http://localhost:${PORT}/api`);
});
