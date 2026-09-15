import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const { Pool } = pg;
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false } }) : null;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(',') : '*' }));
app.use(express.json({ limit: '1mb' }));

const sign = (user) => jwt.sign(user, process.env.JWT_SECRET || 'development-only-change-me', { expiresIn: '7d' });

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'digital-skill-passport-api' }));

app.post('/api/auth/demo', async (req, res) => {
  const { name, email, role = 'student' } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  const user = { id: email.toLowerCase(), name, email: email.toLowerCase(), role };
  if (pool) {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (id text primary key, name text not null, email text unique not null, role text not null, created_at timestamptz default now())`);
    await pool.query(`INSERT INTO users(id,name,email,role) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET name=$2, role=$4`, [user.id, user.name, user.email, user.role]);
  }
  res.json({ token: sign(user), user });
});

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  try { req.user = jwt.verify(h.slice(7), process.env.JWT_SECRET || 'development-only-change-me'); next(); }
  catch { res.status(401).json({ error: 'Invalid or expired token' }); }
}

app.get('/api/me', auth, async (req, res) => {
  if (!pool) return res.json({ user: req.user });
  const { rows } = await pool.query('SELECT id,name,email,role,created_at FROM users WHERE id=$1', [req.user.id]);
  res.json({ user: rows[0] || req.user });
});

app.put('/api/me', auth, async (req, res) => {
  const { name, role } = req.body || {};
  if (!pool) return res.json({ user: { ...req.user, ...(name ? { name } : {}), ...(role ? { role } : {}) } });
  await pool.query('UPDATE users SET name=COALESCE($2,name), role=COALESCE($3,role) WHERE id=$1', [req.user.id, name || null, role || null]);
  const { rows } = await pool.query('SELECT id,name,email,role,created_at FROM users WHERE id=$1', [req.user.id]);
  res.json({ user: rows[0] });
});

app.post('/api/resumes', auth, upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'resume file is required' });
  res.json({ ok: true, filename: req.file.originalname, size: req.file.size, message: 'Upload received. Connect object storage for persistent files.' });
});

app.post('/api/skill-gap', auth, (req, res) => {
  const role = req.body?.role || 'Frontend Developer';
  const gaps = {
    'Frontend Developer': [{skill:'React',current:72,target:85},{skill:'TypeScript',current:55,target:80},{skill:'Testing',current:48,target:75}],
    'Data Analyst': [{skill:'SQL',current:68,target:85},{skill:'Python',current:62,target:80},{skill:'Data Visualization',current:50,target:75}],
    'Product Designer': [{skill:'Figma',current:70,target:85},{skill:'User Research',current:58,target:80},{skill:'Prototyping',current:65,target:82}]
  };
  res.json({ role, gaps: gaps[role] || gaps['Frontend Developer'] });
});

app.listen(process.env.PORT || 3000, () => console.log(`Digital Skill Passport API running on port ${process.env.PORT || 3000}`));
