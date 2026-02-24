'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ระบบป้องกัน: ถ้าไม่ใช่ Admin จะถูกดีดกลับหน้าเลือกสถานะ
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      alert('🔒 Access Denied: คุณไม่มีสิทธิ์เข้าถึงหน้าผู้ดูแลระบบ');
      router.push('/selection');
    } else {
      // ดึงข้อมูลจริงจาก PostgreSQL มาแสดงผล
      fetch('/api/courses')
        .then(res => res.json())
        .then(data => {
          setCourses(data);
          setLoading(false);
        })
        .catch(err => console.error(err));
    }
  }, [router]);

  return (
    <main className="p-8 bg-slate-100 min-h-screen font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Bar สำหรับ Admin */}
        <nav className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex justify-between items-center">
          <div className="font-black text-purple-900 text-lg flex items-center gap-2">
            🛠️ <span>CPSU Admin Panel</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push('/')} className="px-4 py-2 text-slate-500 hover:bg-slate-100 font-bold rounded-lg text-sm transition-colors border border-transparent">👀 ทดลองมุมมองนักศึกษา</button>
            <button className="px-4 py-2 bg-purple-50 text-purple-700 font-bold rounded-lg text-sm border border-purple-200">จัดการข้อมูลหลักสูตร</button>
            <button onClick={() => router.push('/selection')} className="px-4 py-2 text-red-500 hover:bg-red-50 font-bold rounded-lg text-sm transition-colors ml-2">ออกจากระบบ</button>
          </div>
        </nav>

        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border-l-8 border-purple-600">
          <div>
            <h1 className="text-2xl font-black text-slate-800">จัดการโครงสร้างหลักสูตร</h1>
            <p className="text-sm text-slate-500 font-medium">จัดการ Master Data สาขา CS และ IT (2560/2565)</p>
          </div>
          <div className="flex gap-3">
             <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 shadow-md shadow-purple-200">+ เพิ่มรายวิชาใหม่</button>
             <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-300">อัปโหลดหลักสูตร (PDF)</button>
          </div>
        </header>

        {/* ส่วนสรุปสถิติ (Stats Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">จำนวนวิชาในฐานข้อมูล</p>
            <p className="text-3xl font-black text-purple-600">{courses.length} <span className="text-sm text-slate-400 font-medium">รายการ</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">หลักสูตรที่รองรับ</p>
            <p className="text-3xl font-black text-slate-700">4 <span className="text-sm text-slate-400 font-medium">หลักสูตร</span></p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">สถานะฐานข้อมูล (Database Status)</p>
            <p className="text-lg font-bold text-emerald-600 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              เชื่อมต่อ PostgreSQL สำเร็จ
            </p>
          </div>
        </div>

        {/* ตารางจัดการข้อมูล */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">รายการรายวิชาทั้งหมด</h3>
            <span className="text-xs font-bold text-slate-400">เรียงตามรหัสวิชา</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b text-slate-400 uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="p-4">รหัสวิชา</th>
                  <th className="p-4">ชื่อรายวิชา</th>
                  <th className="p-4 text-center">หน่วยกิต</th>
                  <th className="p-4 text-center">หลักสูตร</th>
                  <th className="p-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="p-10 text-center animate-pulse font-bold text-purple-500">กำลังโหลดข้อมูลจาก PostgreSQL...</td></tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.course_code} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-purple-600">{course.course_code}</td>
                      <td className="p-4 font-medium text-slate-700">{course.course_name}</td>
                      <td className="p-4 text-center font-bold text-slate-400">{course.credits}</td>
                      <td className="p-4 text-center">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold">CS 2565</span>
                      </td>
                      <td className="p-4 text-center">
                        <button className="text-blue-500 hover:text-blue-700 mr-3 font-bold">แก้ไข</button>
                        <button className="text-red-400 hover:text-red-600 font-bold">ลบ</button>
                      </td>
                    </tr>
                  ))
                )}
                {courses.length === 0 && !loading && (
                   <tr><td colSpan="5" className="p-10 text-center text-slate-400">ไม่มีข้อมูลในฐานข้อมูล</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}