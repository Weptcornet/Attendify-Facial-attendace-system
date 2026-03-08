import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Save, Loader2, CheckCircle2, History, Clock, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface UserData {
  id: number;
  name: string;
  employee_id: string;
  profile_picture?: string;
}

interface AttendanceRecord {
  id: number;
  name: string;
  employee_id: string;
  timestamp: string;
  image_data: string;
  location: string;
}

export const ProfilePage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Error fetching users:", err));
  };

  const fetchAttendanceLogs = (userId: number) => {
    setIsLogsLoading(true);
    fetch(`/api/attendance/${userId}`)
      .then(res => res.json())
      .then(data => {
        setAttendanceLogs(data);
        setIsLogsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching attendance logs:", err);
        setIsLogsLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectUser = (user: UserData) => {
    setSelectedUser(user);
    setName(user.name);
    setEmployeeId(user.employee_id);
    setProfilePicture(user.profile_picture || null);
    setStatus('idle');
    fetchAttendanceLogs(user.id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, employee_id: employeeId, profile_picture: profilePicture })
      });

      if (response.ok) {
        setStatus('success');
        fetchUsers(); // Refresh list
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error("Save error:", err);
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-zinc-900 leading-tight">
          Manage <br />
          <span className="text-emerald-600">Profiles</span>
        </h2>
        <p className="text-zinc-500 mt-2">View and update employee or student information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User List */}
        <div className="md:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Select Profile</h3>
          <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-zinc-200">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedUser?.id === user.id 
                    ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                    : 'bg-white border-zinc-200 hover:border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden ${
                    selectedUser?.id === user.id ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {user.profile_picture ? (
                      <img src={user.profile_picture} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-900 truncate text-sm">{user.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase">{user.employee_id}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Edit Form & Logs */}
        <div className="md:col-span-2 space-y-6">
          {selectedUser ? (
            <>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">Edit Profile</h3>
                    <p className="text-xs text-zinc-500">Update details for {selectedUser.name}</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center overflow-hidden group-hover:border-emerald-500 transition-all">
                        {profilePicture ? (
                          <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-8 h-8 text-zinc-300" />
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Click to upload profile photo</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Employee / Student ID
                    </label>
                    <input
                      type="text"
                      required
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSaving || status === 'success'}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 ${
                        status === 'success' ? 'bg-emerald-500' : 'bg-zinc-900 hover:bg-zinc-800'
                      }`}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : status === 'success' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Saved Successfully
                        </>
                      ) : status === 'error' ? (
                        'Error Updating Profile'
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>

              {/* Attendance Logs Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
                      <History className="w-5 h-5 text-zinc-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">Recent Activity</h3>
                      <p className="text-xs text-zinc-500">Attendance logs for this user</p>
                    </div>
                  </div>
                </div>

                {isLogsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                  </div>
                ) : attendanceLogs.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-zinc-100 rounded-xl">
                    <p className="text-zinc-400 text-sm">No activity logs found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attendanceLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-200">
                          <img src={log.image_data} alt="Log" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-zinc-500 mb-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-700">
                            <MapPin className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs truncate font-mono">{log.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          ) : (
            <div className="h-full bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center">
              <User className="w-12 h-12 text-zinc-300 mb-4" />
              <p className="text-zinc-500 text-sm">Select a profile from the list to view or edit details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
