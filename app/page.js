'use client'; // บรรทัดที่ 1 ต้องเป็นคำสั่งนี้เท่านั้น

import { useState, useEffect } from 'react';

// --- ข้อมูลจำลองหลักสูตรตามขอบเขต 1.3.1 (ตัวอย่าง CS65) --- [cite: 960, 961]
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

  // โหลด Library และตั้งค่า Worker ให้เสถียรที่สุด
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
    if (!file || !pdfjs) return;

    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(" ") + " ";
      }

      // Regex สกัด รหัส, ชื่อ, หน่วยกิต, เกรด (ตรงตาม Scope 1.3.2) 
      const regex = /\b([0-9]{6}|SU[0-9]{3})\b\s+(.+?)\s+(\d)\s+([A-D][+]?|[FWSU][*]?)(?=\s|$)/g;
      let match;
      const extracted = [];
      let totalPoints = 0;
      let creditForGPAX = 0;
      let totalPassCredits = 0;

      while ((match = regex.exec(fullText)) !== null) {
        const item = { code: match[1], name: match[2].trim(), credit: parseInt(match[3]), grade: match[4] };
        extracted.push(item);

        if (!["W", "S*", "U", "S"].includes(item.grade)) {
          totalPoints += getGradeValue(item.grade) * item.credit;
          creditForGPAX += item.credit;
        }
        if (!["F", "W", "U"].includes(item.grade)) {
          totalPassCredits += item.credit;
        }
      }

      setResults(extracted);
      setSummary({
        gpax: creditForGPAX > 0 ? (totalPoints / creditForGPAX).toFixed(2) : "0.00",
        totalCredits: totalPassCredits
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
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">🎓 ระบบวิเคราะห์ข้อมูลเพื่อวางแผนการเรียน</h1>
          <p className="text-slate-500 font-medium">กรณีศึกษา ภาควิชาคอมพิวเตอร์ มหาวิทยาลัยศิลปากร (BSCS68T2-11)</p>
        </header>

        {/* ส่วนอัปโหลด - ตรงตามขอบเขตผู้ใช้ 1.3.3 */} [cite: 969]
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8 text-center">
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
          {loading && <p className="mt-4 text-blue-600 animate-pulse font-bold">กำลังสกัดข้อมูลตามหลักสูตร...</p>}
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 📊 Dashboard สรุปผล - ตรงตามขอบเขต 1.3.2 ข้อ 2 & 3 */} 
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-8 rounded-[2rem] shadow-xl">
                <h3 className="text-lg font-medium opacity-80">คะแนนเฉลี่ยสะสม (GPAX)</h3>
                <p className="text-6xl font-black mt-2">{summary.gpax}</p>
                <div className="mt-6 pt-6 border-t border-blue-400/30">
                  <p className="text-sm">เกียรตินิยมอันดับ 1: <span className="font-bold">3.60 ขึ้นไป</span></p>
                  <p className="text-sm">สถานภาพปัจจุบัน: <span className="font-bold bg-green-400/20 px-2 rounded">ปกติ</span></p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-6 flex justify-between items-center">
                  ความครบถ้วนของหลักสูตร
                  <span className="text-xs font-normal text-slate-400">เป้าหมาย {CURRICULUM_DATA.totalRequired} นก.</span>
                </h3>
                {CURRICULUM_DATA.categories.map((cat, idx) => {
                  const passInCat = results.filter(r => cat.courses.includes(r.code) && !["F", "W"].includes(r.grade)).reduce((a, c) => a + c.credit, 0);
                  const percent = Math.min((passInCat / cat.required) * 100, 100);
                  return (
                    <div key={idx} className="mb-6">
                      <div className="flex justify-between text-xs mb-2 font-bold">
                        <span className="text-slate-600">{cat.name}</span>
                        <span className="text-blue-700">{passInCat}/{cat.required} นก.</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div className="bg-blue-600 h-3 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 📝 ตารางรายวิชาสกัดจริง - ตรงตามขอบเขต 1.3.2 ข้อ 1 */} 
            <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="font-bold text-lg text-slate-800">รายวิชาที่เรียนผ่านมาแล้ว ({summary.totalCredits} หน่วยกิต)</h3>
              </div>
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white sticky top-0 shadow-sm">
                    <tr>
                      <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">รหัสวิชา</th>
                      <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">ชื่อวิชา</th>
                      <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">นก.</th>
                      <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">เกรด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {results.map((item, index) => (
                      <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-5 text-sm font-mono font-bold text-blue-600">{item.code}</td>
                        <td className="p-5 text-sm text-slate-600 leading-relaxed">{item.name}</td>
                        <td className="p-5 text-sm text-center font-medium text-slate-400">{item.credit}</td>
                        <td className={`p-5 text-sm text-center font-black ${['F', 'W'].includes(item.grade) ? 'text-red-500' : 'text-green-600'}`}>{item.grade}</td>
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