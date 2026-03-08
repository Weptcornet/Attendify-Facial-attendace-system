import React, { useState, useEffect } from 'react';
import { Bell, Shield, Smartphone, Info, ChevronRight, ToggleLeft as Toggle, ToggleRight } from 'lucide-react';
import { motion } from 'motion/react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'attendance_reminders',
      title: 'Attendance Reminders',
      description: 'Get notified when it\'s time to mark your attendance.',
      enabled: true,
    },
    {
      id: 'system_updates',
      title: 'System Updates',
      description: 'Stay informed about new features and maintenance.',
      enabled: false,
    },
    {
      id: 'security_alerts',
      title: 'Security Alerts',
      description: 'Receive alerts for unusual login attempts or profile changes.',
      enabled: true,
    },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('attendify_notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  const toggleNotification = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, enabled: !n.enabled } : n
    );
    setNotifications(updated);
    localStorage.setItem('attendify_notifications', JSON.stringify(updated));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-zinc-900 leading-tight">
          App <br />
          <span className="text-emerald-600">Settings</span>
        </h2>
        <p className="text-zinc-500 mt-2">Manage your preferences and app configuration.</p>
      </div>

      <div className="space-y-6">
        {/* Notifications Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Notification Preferences</h3>
          </div>
          
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            {notifications.map((item, idx) => (
              <div 
                key={item.id}
                className={`p-4 flex items-center justify-between transition-colors ${
                  idx !== notifications.length - 1 ? 'border-b border-zinc-100' : ''
                }`}
              >
                <div className="pr-4">
                  <h4 className="text-sm font-bold text-zinc-900">{item.title}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>
                </div>
                <button 
                  onClick={() => toggleNotification(item.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    item.enabled ? 'bg-emerald-500' : 'bg-zinc-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      item.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Device Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Device & Security</h3>
          </div>
          
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <button className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-zinc-600" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-zinc-900">Biometric Authentication</h4>
                  <p className="text-[10px] text-zinc-500">Use fingerprint or face ID to unlock</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-300" />
            </button>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                  <Info className="w-4 h-4 text-zinc-600" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-zinc-900">App Version</h4>
                  <p className="text-[10px] text-zinc-500">Attendify v1.0.4 (Stable)</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Latest</span>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-4">
          <button className="w-full p-4 rounded-2xl border border-red-100 bg-red-50/30 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors">
            Reset All Settings
          </button>
        </section>
      </div>
    </div>
  );
};
