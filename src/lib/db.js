import pool from '@/lib/db';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;