'use client';
import { useState } from 'react';

export default function Home() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันสกัดข้อมูล PDF
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // โหลด Library เฉพาะตอนใช้งานจริง (แก้ปัญหา DOMMatrix is not defined)
      const pdfjs = await import('pdfjs-dist');
      // ใช้ Worker จาก CDN ตัวที่เสถียรที่สุด
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += pageText + " ";
      }

      // Regex แกะรหัสวิชาและเกรด
      // const regex = /([0-9]{6,7})\s+.*?\s+([A-D][+]?|F|W|S|U)/g;
      // 1. Regex ใหม่: เจาะจงรหัสวิชา ม.ศิลปากร (ขึ้นต้นด้วย 5 หรือ SU) 
      // พร้อมดึงหน่วยกิต (Credit) และเกรด (Grade) รวมถึงเกรดพิเศษอย่าง S*
      // const regex = /\b(5\d{5}|SU\d{3})\b.*?\s+(\d)\s+([A-D][+]?|[FWSU][*]?)\b/g;
      const regex = /\b([0-9]{6}|SU[0-9]{3})\b.*?\s+(\d)\s+([A-D][+]?|[FWSU][*]?)(?=\s|$)/g;
      let match;
      const extractedData = [];

      while ((match = regex.exec(fullText)) !== null) {
        extractedData.push({
          courseId: match[1], // รหัสวิชา (รับหมดทั้ง 5xxxxx, 4xxxxx และ SUxxx)
          credit: match[2],   // หน่วยกิต
          grade: match[3]     // เกรด (ดึงมาครบทั้ง B+, C+, S*)
        });
      }
      setResults(extractedData);
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 💡 แผนสำรอง: ฟังก์ชันจำลองข้อมูล (สำหรับใช้ทำ Mockup พรีเซนต์)
  const loadMockData = () => {
    setResults([
      { courseId: '517111', grade: 'B+' },
      { courseId: '517121', grade: 'A' },
      { courseId: '514107', grade: 'C' },
      { courseId: '081102', grade: 'B' }
    ]);
  };

  return (
    <main className="p-10 font-sans min-h-screen bg-white text-black">
      <div className="max-w-2xl mx-auto border p-8 rounded-xl shadow-lg bg-white">
        <h1 className="text-2xl font-bold mb-4 text-blue-800">ระบบจำลองแผนการเรียน (Thesis Mockup)</h1>
        
        <div className="flex gap-2 mb-6">
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full text-sm border p-2 rounded" />
          <button onClick={loadMockData} className="bg-gray-200 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300">
            ใช้ข้อมูลจำลอง (Demo)
          </button>
        </div>

        {loading && <div className="text-center py-4 text-blue-600 animate-pulse">กำลังสกัดข้อมูลจาก PDF...</div>}

        {results.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-bold mb-4">ข้อมูลรายวิชาและเกรดที่สกัดได้:</h2>
            <div className="grid grid-cols-2 gap-3">
              {results.map((item, idx) => (
                <div key={idx} className="flex justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <span className="font-mono">{item.courseId}</span>
                  <span className="font-bold text-blue-700">{item.grade}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}