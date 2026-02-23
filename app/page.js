'use client';

import { useState, useEffect } from 'react';

// ข้อมูลหลักสูตรตามขอบเขต 1.3.1
const CURRICULUM_DATA = {
  name: "วิทยาการคอมพิวเตอร์ 2565",
  totalRequired: 126,
  categories: [
    { name: "ศึกษาทั่วไป", required: 30, courses: ["SU101", "SU201", "SU301", "SU102", "SU164", "SU202", "SU203", "SU218", "SU318", "SU401", "SU402"] },
    { name: "วิชาเฉพาะ/บังคับ", required: 90, courses: ["511108", "517101", "517121", "515104", "517112", "517122", "515232", "517211", "517212", "517221", "517222", "511246", "517242", "517261", "520231", "517311", "517312", "517321", "517324", "520251", "517331", "517392", "517461", "520361"] },
    { name: "เลือกเสรี", required: 6, courses: ["459166", "459393"] }
  ]
};

export default function Home() {
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState({ gpax: "0.00", totalCredits: 0 });
  const [loading, setLoading] = useState(false);
  const [pdfjs, setPdfjs] = useState(null);

  useEffect(() => {
    import('pdfjs-dist').then((module) => {
      module.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${module.version}/build/pdf.worker.min.mjs`;
      setPdfjs(module);
    });
  }, []);

  const getGradeValue = (g) => {
    const v = { "A": 4, "B+": 3.5, "B": 3, "C+": 2.5, "C": 2, "D+": 1.5, "D": 1, "F": 0 };
    return v[g] || 0;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!pdfjs) return alert("ระบบกำลังโหลดเครื่องมือ กรุณารอสักครู่แล้วกดใหม่ครับ");

    setLoading(true);
    setResults([]);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let allExtracted = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // 1. จัดกลุ่มข้อความตามบรรทัด (แกน Y) อนุโลมความคลาดเคลื่อน 4 pixel
        const lines = {};
        textContent.items.forEach(item => {
          const y = Math.round(item.transform[5] / 4) * 4;
          if (!lines[y]) lines[y] = [];
          lines[y].push(item);
        });

        const sortedY = Object.keys(lines).sort((a, b) => b - a);
        
        sortedY.forEach(y => {
          // 2. เรียงตัวอักษรจากซ้ายไปขวา (แกน X)
          lines[y].sort((a, b) => a.transform[4] - b.transform[4]);
          
          let rawLine = "";
          let previousRightEdge = -1;
          
          lines[y].forEach(item => {
            const x = item.transform[4];
            const width = item.width;
            const text = item.str.replace(/\s+/g, ''); // บังคับลบช่องว่างที่แฝงมา
            
            if (!text) return; 
            
            // 3. ✨ ท่าไม้ตายคณิตศาสตร์: ถ้าพิกัดตัวอักษรห่างกันเกิน 8 pixel ค่อยเติมช่องว่าง
            // วิธีนี้ทำให้ สระและวรรณยุกต์ภาษาไทย (ที่พิกัดซ้อนกัน) เชื่อมติดกัน 100%
            if (previousRightEdge !== -1 && (x - previousRightEdge) > 8) {
              rawLine += " ";
            }
            rawLine += text;
            previousRightEdge = x + width;
          });

          // 4. สกัดข้อมูลด้วย Regex (กรองเฉพาะรหัสวิชาของศิลปากร)
          const match = rawLine.match(/\b(5\d{5}|4\d{5}|SU\d{3})\b\s+(.+?)\s+(\d)\s+([A-D][+]?|[FWSU][*]?)(?=\s|$)/);
          
          if (match) {
            allExtracted.push({
              code: match[1],
              name: match[2].trim(), // ตอนนี้ชื่อวิชาจะเรียงสวยงามแล้ว
              credit: parseInt(match[3]),
              grade: match[4]
            });
          }
        });
      }

      let totalPoints = 0, creditForGPAX = 0, totalPass = 0;
      allExtracted.forEach(item => {
        if (!["W", "S*", "U", "S"].includes(item.grade)) {
          totalPoints += getGradeValue(item.grade) * item.credit;
          creditForGPAX += item.credit;
        }
        if (!["F", "W", "U"].includes(item.grade)) totalPass += item.credit;
      });

      setResults(allExtracted);
      setSummary({
        gpax: creditForGPAX > 0 ? (totalPoints / creditForGPAX).toFixed(2) : "0.00",
        totalCredits: totalPass
      });

    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">🎓 ระบบวิเคราะห์แผนการเรียน</h1>
          <p className="text-slate-500 font-medium">ภาควิชาคอมพิวเตอร์ มหาวิทยาลัยศิลปากร</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 text-center">
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
          {loading && <p className="mt-4 text-blue-600 animate-pulse font-bold">กำลังเรียงพิกัดอักขระภาษาไทย...</p>}
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-8 rounded-3xl shadow-xl">
                <h3 className="text-lg opacity-80">GPAX ปัจจุบัน</h3>
                <p className="text-6xl font-black mt-2">{summary.gpax}</p>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="font-bold mb-4 border-b pb-2 text-sm">ความครบถ้วนของหลักสูตร</h3>
                {CURRICULUM_DATA.categories.map((cat, idx) => {
                  const passInCat = results.filter(r => cat.courses.includes(r.code) && !["F", "W"].includes(r.grade)).reduce((a, c) => a + c.credit, 0);
                  const percent = Math.min((passInCat / cat.required) * 100, 100);
                  return (
                    <div key={idx} className="mb-4">
                      <div className="flex justify-between text-xs mb-1 font-bold">
                        <span>{cat.name}</span>
                        <span className="text-blue-600">{passInCat}/{cat.required}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b font-bold text-sm">รายวิชาที่วิเคราะห์สำเร็จ ({summary.totalCredits} หน่วยกิต)</div>
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white sticky top-0 shadow-sm">
                    <tr>
                      <th className="p-4 text-slate-400">รหัส</th>
                      <th className="p-4 text-slate-400">ชื่อวิชา</th>
                      <th className="p-4 text-center text-slate-400">นก.</th>
                      <th className="p-4 text-center text-slate-400">เกรด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((item, index) => (
                      <tr key={index} className="hover:bg-blue-50 transition-colors">
                        <td className="p-4 font-mono font-bold text-blue-600">{item.code}</td>
                        <td className="p-4 font-medium text-slate-700">{item.name}</td>
                        <td className="p-4 text-center font-bold text-slate-400">{item.credit}</td>
                        <td className={`p-4 text-center font-black ${['F', 'W'].includes(item.grade) ? 'text-red-500' : 'text-green-600'}`}>{item.grade}</td>
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