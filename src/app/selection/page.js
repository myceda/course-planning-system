'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Role, 2: Login, 3: Options
  const [role, setRole] = useState(null); // 'student' หรือ 'admin'
  const [user, setUser] = useState(null);
  const [major, setMajor] = useState('CS'); 
  const [year, setYear] = useState('2565'); 

  // เคลียร์ข้อมูลเก่าเมื่อกลับมาหน้านี้ (เหมือนการ Logout)
  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleGoogleLogin = () => {
    // จำลองข้อมูลตาม Role ที่เลือก
    const mockUser = role === 'admin' 
      ? { name: 'Admin SU', email: 'admin@su.ac.th', avatar: '🛠️' }
      : { name: 'Phuwadet Namphrai', email: 'phuwadet_n@su.ac.th', avatar: '👤' };
    
    setUser(mockUser);
    localStorage.setItem('userRole', role); // บันทึกสิทธิ์ไว้เช็คในหน้าอื่น
    setStep(3);
  };

  const handleStart = () => {
    if (role === 'admin') {
      router.push('/admin'); // Admin ไปหน้าจัดการ
    } else {
      router.push('/'); // Student ไปหน้า Dashboard
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {step === 1 && (
          <div className="p-10 text-center animate-in fade-in zoom-in duration-500">
            <div className="text-6xl mb-6">👥</div>
            <h1 className="text-2xl font-black mb-2 text-slate-800">เลือกสถานะผู้ใช้งาน</h1>
            <p className="text-slate-500 text-sm mb-8">กรุณาระบุสถานะของคุณก่อนเข้าสู่ระบบ</p>
            
            <div className="space-y-4">
              <button onClick={() => handleSelectRole('student')} className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 font-bold text-slate-700 transition-all flex items-center justify-between">
                <span>👨‍🎓 นักศึกษา (Student)</span> <span>➔</span>
              </button>
              <button onClick={() => handleSelectRole('admin')} className="w-full p-4 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50 font-bold text-slate-700 transition-all flex items-center justify-between">
                <span>🛠️ ผู้ดูแลระบบ (Admin)</span> <span>➔</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-10 text-center animate-in slide-in-from-right duration-500">
            <button onClick={() => setStep(1)} className="text-xs text-slate-400 font-bold mb-4 hover:text-slate-600 flex items-center gap-1">← ย้อนกลับ</button>
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-2xl font-black mb-2 text-slate-800">เข้าสู่ระบบ ({role === 'admin' ? 'Admin' : 'Student'})</h1>
            <p className="text-slate-500 text-sm mb-8">กรุณาเข้าสู่ระบบด้วยอีเมลมหาวิทยาลัย (@su.ac.th)</p>
            
            <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" width="20" alt="google" />
              Sign in with Google
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className={`${role === 'admin' ? 'bg-purple-900' : 'bg-blue-900'} p-8 text-center text-white`}>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl border-4 border-white/30 shadow-lg">{user.avatar}</div>
              </div>
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-white/70 text-xs">{user.email}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest">{role}</div>
            </div>

            <div className="p-8 space-y-8">
              {role === 'student' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">1. เลือกสาขาวิชา</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setMajor('CS')} className={`p-4 rounded-2xl border-2 transition-all font-bold ${major === 'CS' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-100 text-slate-400'}`}>CS</button>
                      <button onClick={() => setMajor('IT')} className={`p-4 rounded-2xl border-2 transition-all font-bold ${major === 'IT' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-100 text-slate-400'}`}>IT</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">2. เลือกปีหลักสูตร</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setYear('2560')} className={`p-4 rounded-2xl border-2 transition-all font-bold ${year === '2560' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-100 text-slate-400'}`}>พ.ศ. 2560</button>
                      <button onClick={() => setYear('2565')} className={`p-4 rounded-2xl border-2 transition-all font-bold ${year === '2565' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-100 text-slate-400'}`}>พ.ศ. 2565</button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-medium">
                  ยืนยันสิทธิ์ผู้ดูแลระบบสำเร็จ<br/>พร้อมเข้าสู่หน้าจัดการฐานข้อมูล
                </div>
              )}

              <button onClick={handleStart} className={`w-full text-white py-4 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95 ${role === 'admin' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                {role === 'admin' ? 'เข้าสู่ระบบจัดการ (Admin)' : 'เริ่มการวิเคราะห์'}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}