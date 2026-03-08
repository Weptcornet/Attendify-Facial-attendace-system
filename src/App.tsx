import React, { useState } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { AttendanceForm } from './components/AttendanceForm';
import { AttendanceHistory } from './components/AttendanceHistory';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { ShieldCheck, LayoutDashboard, History, Camera as CameraIcon, UserCircle, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'capture' | 'history' | 'profile' | 'settings'>('capture');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-zinc-200 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-black tracking-tight text-zinc-900">ATTENDIFY</h1>
          </div>
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-full">
            <button 
              onClick={() => setActiveTab('capture')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'capture' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
              }`}
            >
              Capture
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'history' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
              }`}
            >
              History
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-8">
        {activeTab === 'capture' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key="capture-tab"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-black text-zinc-900 leading-tight">
                Daily Attendance <br />
                <span className="text-emerald-600">Check-in</span>
              </h2>
              <p className="text-zinc-500 mt-2">Capture your photo to mark attendance for today.</p>
            </div>

            <div className="space-y-6">
              {!capturedImage ? (
                <CameraCapture onCapture={handleCapture} />
              ) : (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-200 bg-black aspect-[4/3]">
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 border-4 border-emerald-500/50 rounded-2xl pointer-events-none" />
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                    Captured
                  </div>
                </div>
              )}

              <AttendanceForm 
                capturedImage={capturedImage} 
                onSuccess={handleSuccess}
                onReset={() => setCapturedImage(null)} 
              />
            </div>
          </motion.div>
        ) : activeTab === 'history' ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            key="history-tab"
          >
            <AttendanceHistory key={refreshKey} />
          </motion.div>
        ) : activeTab === 'profile' ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            key="profile-tab"
          >
            <ProfilePage />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            key="settings-tab"
          >
            <SettingsPage />
          </motion.div>
        )}
      </main>

      {/* Bottom Navigation (Mobile Style) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 z-50 border border-white/10">
        <button 
          onClick={() => setActiveTab('capture')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'capture' ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
        >
          <CameraIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Capture</span>
        </button>
        <div className="w-px h-6 bg-white/10" />
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Logs</span>
        </button>
        <div className="w-px h-6 bg-white/10" />
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
        >
          <UserCircle className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
        </button>
        <div className="w-px h-6 bg-white/10" />
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
        </button>
      </nav>
    </div>
  );
}
