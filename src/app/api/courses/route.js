import { NextResponse } from 'next/server';
import { Pool } from 'pg'; // เรียกใช้ pg โดยตรงในไฟล์นี้เลย

// สร้างตัวเชื่อมต่อ Database ไว้ตรงนี้เลย
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    // ดึงข้อมูลจาก Database จริงๆ
    const res = await pool.query('SELECT * FROM courses');
    return NextResponse.json(res.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}