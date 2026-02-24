'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ตัวแปลงเกรดเป็นตัวเลข
const GRADE_POINTS = { 'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0, 'D+': 1.5, 'D': 1.0, 'F': 0.0 };

export default function SimulationPage() {
  const router = useRouter();
  const [role, setRole] = useState(null);

  // สมมติข้อมูลปัจจุบันของนักศึกษา
  const currentGPAX = 2.78;
  const currentTotalCredits = 96; 
  const currentTotalPoints = currentGPAX * currentTotalCredits;

  // รายวิชาที่วางแผนจะลงเรียน
  const [plannedCourses, setPlannedCourses] = useState([
    { id: 1, code: '517493', name: 'โครงงานวิจัย 1', credit: 1, grade: 'A' },
    { id: 2, code: '517331', name: 'ปัญญาประดิษฐ์', credit: 3, grade: 'B+' }
  ]);

  // ฟอร์มสำหรับเพิ่มวิชาใหม่
  const [newCourse, setNewCourse] = useState({ code: '', name: '', credit: 3, grade: 'A' });

  // โหลดสิทธิ์ผู้ใช้จาก LocalStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') || 'student';
    setRole(savedRole);
  }, []);

  // คำนวณ GPAX ใหม่แบบ Real-time
  const projectedGPAX = useMemo(() => {
    let newCredits = 0;
    let newPoints = 0;

    plannedCourses.forEach(course => {
      if (GRADE_POINTS[course.grade] !== undefined) {
        newCredits += Number(course.credit);
        newPoints += Number(course.credit) * GRADE_POINTS[course.grade];
      }
    });

    const totalCreditsNow = currentTotalCredits + newCredits;
    const totalPointsNow = currentTotalPoints + newPoints;
    
    return totalCreditsNow === 0 ? "0.00" : (totalPointsNow / totalCreditsNow).toFixed(2);
  }, [plannedCourses]);

  const handleAddCourse = () => {
    if (!newCourse.code || !newCourse.name) return alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    setPlannedCourses([...plannedCourses, { ...newCourse, id: Date.now() }]);
    setNewCourse({ code: '', name: '', credit: 3, grade: 'A' }); // Reset form
  };

  const removeCourse = (id) => {
    setPlannedCourses(plannedCourses.filter(c => c.id !== id));
  };

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation Bar */}
        <nav className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex justify-between items-center">
          <div className="font-black text-blue-900 text-lg flex items-center gap-2">
            🎓 <span>CPSU System</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push('/')} className="px-4 py-2 text-slate-500 hover:bg-slate-100 font-bold rounded-lg text-sm transition-colors">หน้าแรก</button>
            <button className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm">จำลองเกรด</button>
            {role === 'admin' && (
              <button onClick={() => router.push('/admin')} className="px-4 py-2 text-purple-600 hover:bg-purple-50 font-bold rounded-lg text-sm transition-colors border border-purple-200">🛠️ จัดการระบบ (Admin)</button>
            )}
            <button onClick={() => router.push('/selection')} className="px-4 py-2 text-red-500 hover:bg-red-50 font-bold rounded-lg text-sm transition-colors ml-2">ออกจากระบบ</button>
          </div>
        </nav>

        {/* Header */}
        <header className="mb-8 border-b pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900 mb-2">📊 ระบบจำลองผลการเรียน (Grade Simulation)</h1>
            <p className="text-slate-500 font-medium">วางแผนการลงทะเบียนและคาดการณ์เกรดเฉลี่ยสะสม (GPAX)</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 animate-in fade-in zoom-in-95">
          {/* การ์ด GPAX ปัจจุบัน */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
            <p className="text-slate-500 font-bold mb-2">GPAX ปัจจุบัน</p>
            <p className="text-5xl font-black text-slate-700">{currentGPAX.toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-2">หน่วยกิตสะสม: {currentTotalCredits} นก.</p>
          </div>

          {/* การ์ด ลูกศร */}
          <div className="flex items-center justify-center">
            <div className="text-slate-300 text-6xl animate-pulse">➔</div>
          </div>

          {/* การ์ด GPAX ที่คาดหวัง */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-700 text-white p-6 rounded-2xl shadow-lg text-center transform scale-105">
            <p className="text-green-100 font-bold mb-2">GPAX ที่คาดการณ์ (Projected)</p>
            <p className="text-6xl font-black drop-shadow-md">{projectedGPAX}</p>
            <p className="text-xs text-green-200 mt-2">ถ้าระดับคะแนนเป็นไปตามแผน</p>
          </div>
        </div>

        {/* ส่วนจัดการรายวิชา */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 bg-slate-50 border-b">
            <h3 className="font-bold text-lg text-slate-800">📝 เพิ่มรายวิชาในภาคการศึกษาถัดไป</h3>
            
            {/* ฟอร์มเพิ่มวิชา */}
            <div className="grid grid-cols-12 gap-4 mt-4">
              <input type="text" placeholder="รหัสวิชา" className="col-span-2 p-2 border rounded-lg text-sm" value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} />
              <input type="text" placeholder="ชื่อรายวิชา" className="col-span-5 p-2 border rounded-lg text-sm" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} />
              <select className="col-span-2 p-2 border rounded-lg text-sm" value={newCourse.credit} onChange={e => setNewCourse({...newCourse, credit: Number(e.target.value)})}>
                <option value={1}>1 นก.</option>
                <option value={2}>2 นก.</option>
                <option value={3}>3 นก.</option>
                <option value={4}>4 นก.</option>
              </select>
              <select className="col-span-2 p-2 border rounded-lg text-sm font-bold text-blue-600" value={newCourse.grade} onChange={e => setNewCourse({...newCourse, grade: e.target.value})}>
                {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>เกรด {g}</option>)}
              </select>
              <button onClick={handleAddCourse} className="col-span-1 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 text-sm">+</button>
            </div>
          </div>

          {/* ตารางวิชาที่วางแผน */}
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b">
              <tr>
                <th className="p-4 text-slate-400">รหัสวิชา</th>
                <th className="p-4 text-slate-400">ชื่อรายวิชา</th>
                <th className="p-4 text-center text-slate-400">หน่วยกิต</th>
                <th className="p-4 text-center text-slate-400">เป้าหมายเกรด</th>
                <th className="p-4 text-center text-slate-400">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plannedCourses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-blue-600">{course.code}</td>
                  <td className="p-4 font-medium text-slate-700">{course.name}</td>
                  <td className="p-4 text-center font-bold text-slate-500">{course.credit}</td>
                  <td className="p-4 text-center font-black text-green-600 text-lg">{course.grade}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => removeCourse(course.id)} className="text-red-400 hover:text-red-600 font-bold px-2 py-1 rounded">ลบ</button>
                  </td>
                </tr>
              ))}
              {plannedCourses.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">ยังไม่มีรายวิชาในแผนการเรียน</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}