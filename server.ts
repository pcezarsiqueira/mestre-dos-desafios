
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

// Configurações do Banco de Dados Remoto
const dbConfig = {
    host: '72.60.136.59',
    user: 'root',
    password: 'Al#!9th18',
    database: 'mestredesafios',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 
};

let pool: mysql.Pool;

const connectDB = async () => {
  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log('✅ [DATABASE] MySQL conectado em 72.60.136.59');
    connection.release();
  } catch (err: any) {
    console.error('❌ [DATABASE] Erro MySQL:', err.message);
  }
};

connectDB();

const ensureDb = (req: any, res: any, next: any) => {
  if (!pool) return res.status(503).json({ error: 'Banco de dados offline.' });
  next();
};

// --- ROTAS DA API ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: !!pool });
});

app.post('/api/login', ensureDb, async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            const user = rows[0];
            if (user.branding_json) user.branding = JSON.parse(user.branding_json);
            res.json(user);
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor' });
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
        res.status(500).json({ error: 'Erro ao registrar' });
    }
});

app.get('/api/admin/users', ensureDb, async (req, res) => {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

// --- SERVINDO O FRONTEND (ESTÁTICOS) ---
// Serve a pasta de build do Vite (dist)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback para SPA: qualquer rota que não seja API redireciona para o index.html
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
    res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n🚀 MESTRE DOS DESAFIOS - UNIFICADO`);
    console.log(`----------------------------------`);
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
    console.log(`Modo: Produção/Monolítico`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`----------------------------------\n`);
});
