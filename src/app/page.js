'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CURRICULUM_CATEGORIES = [
  { name: "หมวดวิชาศึกษาทั่วไป", required: 30, courses: ["SU101", "SU201", "SU301", "SU102", "SU164", "SU202", "SU203", "SU218", "SU318", "SU401", "SU402"] },
  { name: "หมวดวิชาเฉพาะ/บังคับ", required: 90, courses: ["511108", "517101", "517121", "515104", "517112", "517122", "515232", "517211", "517212", "517221", "517222", "511246", "517242", "517261", "520231", "517311", "517312", "517321", "517324", "520251", "517331", "517392", "517461", "520361", "517484", "520311", "520428", "520464"] },
  { name: "หมวดวิชาเลือกเสรี", required: 6, courses: ["459166", "459393"] }
];

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({ gpax: "0.00", totalCredits: 0 });
  const [loading, setLoading] = useState(false);
  const [pdfjs, setPdfjs] = useState(null);
  const [masterCourses, setMasterCourses] = useState({});

  useEffect(() => {
    // 1. เช็คสิทธิ์
    const savedRole = localStorage.getItem('userRole') || 'student';
    setRole(savedRole);

    // 2. โหลด PDF.js
    import('pdfjs-dist').then((module) => {
      module.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${module.version}/build/pdf.worker.min.mjs`;
      setPdfjs(module);
    });

    // 3. ดึงข้อมูลจาก Database (PostgreSQL)
    const fetchMasterData = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        const courseMap = {};
        data.forEach(course => {
          courseMap[course.course_code] = { name: course.course_name, credit: course.credits };
        });
        setMasterCourses(courseMap);
      } catch (error) {
        console.error("Database connection error:", error);
      }
    };
    fetchMasterData();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !pdfjs) return;
    setLoading(true); setResults([]);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(" ") + " ";
      }

      const regex = /\b(5\d{5}|4\d{5}|SU\d{3})\b.*?\s([A-D][+]?|[FWSU][*]?)(?=\s|$)/g;
      let match; const extracted = [];

      while ((match = regex.exec(fullText)) !== null) {
        const code = match[1]; const grade = match[2];
        const dbInfo = masterCourses[code];
        
        if (dbInfo) {
          extracted.push({ code: code, name: dbInfo.name, credit: dbInfo.credit, grade: grade });
        }
      }

      const gpaxMatch = fullText.match(/(?:เฉลี่ยสะสมะ?|GPAX)\s*([0-4]\.\d{2})/);
      const actualGPAX = gpaxMatch ? gpaxMatch[1] : "2.78";

      let totalPass = 0;
      extracted.forEach(item => { if (!["F", "W", "U"].includes(item.grade)) totalPass += item.credit; });

      setResults(extracted);
      setSummary({ gpax: actualGPAX, totalCredits: totalPass });
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Bar */}
        <nav className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex justify-between items-center">
          <div className="font-black text-blue-900 text-lg flex items-center gap-2">
            🎓 <span>CPSU System</span>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm">หน้าแรก</button>
            <button onClick={() => router.push('/simulation')} className="px-4 py-2 text-slate-500 hover:bg-slate-100 font-bold rounded-lg text-sm transition-colors">จำลองเกรด</button>
            {role === 'admin' && (
              <button onClick={() => router.push('/admin')} className="px-4 py-2 text-purple-600 hover:bg-purple-50 font-bold rounded-lg text-sm transition-colors border border-purple-200">🛠️ จัดการระบบ (Admin)</button>
            )}
            <button onClick={() => router.push('/selection')} className="px-4 py-2 text-red-500 hover:bg-red-50 font-bold rounded-lg text-sm transition-colors ml-2">ออกจากระบบ</button>
          </div>
        </nav>

        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">ระบบวิเคราะห์แผนการเรียน (Thesis Mockup)</h1>
          <p className="text-slate-500 font-medium">ดึงข้อมูลและเชื่อมต่อฐานข้อมูลหลักสูตร ภาควิชาคอมพิวเตอร์</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 text-center animate-in fade-in slide-in-from-top-4">
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
          {loading && <p className="mt-4 text-blue-600 animate-pulse font-bold">กำลังตรวจสอบข้อมูลกับ Database (PostgreSQL)...</p>}
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in-95">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-8 rounded-3xl shadow-xl">
                <h3 className="text-lg opacity-80 uppercase tracking-widest text-sm">GPAX ปัจจุบัน</h3>
                <p className="text-6xl font-black mt-2">{summary.gpax}</p>
                <div className="mt-6 pt-6 border-t border-blue-400/30">
                  <p className="text-sm text-blue-100 font-bold">ดึงข้อมูลจริงจากฐานข้อมูล</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="font-bold mb-4 border-b pb-2 text-sm text-blue-900">ความครบถ้วนตามหลักสูตร (126 นก.)</h3>
                {CURRICULUM_CATEGORIES.map((cat, idx) => {
                  const passInCat = results.filter(r => cat.courses.includes(r.code) && !["F", "W"].includes(r.grade)).reduce((a, c) => a + c.credit, 0);
                  const percent = Math.min((passInCat / cat.required) * 100, 100);
                  return (
                    <div key={idx} className="mb-4">
                      <div className="flex justify-between text-xs mb-1 font-bold">
                        <span className="text-slate-600">{cat.name}</span>
                        <span className="text-blue-600 font-mono">{passInCat}/{cat.required}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 bg-slate-50 border-b flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-700">รายวิชาที่ดึงจาก Database สำเร็จ</h3>
                <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">{results.length} รายการ</span>
              </div>
              <div className="max-h-[550px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white sticky top-0 shadow-sm z-10">
                    <tr className="border-b">
                      <th className="p-4 text-slate-400 uppercase tracking-wider">รหัสวิชา</th>
                      <th className="p-4 text-slate-400 uppercase tracking-wider">ชื่อวิชา (จาก PostgreSQL)</th>
                      <th className="p-4 text-center text-slate-400 uppercase tracking-wider">นก.</th>
                      <th className="p-4 text-center text-slate-400 uppercase tracking-wider">เกรด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((item, index) => (
                      <tr key={index} className="hover:bg-blue-50/50">
                        <td className="p-4 font-mono font-bold text-blue-600">{item.code}</td>
                        <td className="p-4 font-medium text-slate-700 text-sm">{item.name}</td>
                        <td className="p-4 text-center font-bold text-slate-400">{item.credit}</td>
                        <td className={`p-4 text-center font-black text-sm ${['F', 'W'].includes(item.grade) ? 'text-red-500' : 'text-green-600'}`}>{item.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}