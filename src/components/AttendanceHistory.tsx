import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin, User, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AttendanceRecord {
  id: number;
  name: string;
  employee_id: string;
  timestamp: string;
  image_data: string;
  location: string;
}

export const AttendanceHistory: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchRecords = () => {
    setIsLoading(true);
    fetch('/api/attendance')
      .then(res => res.json())
      .then(data => {
        setRecords(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching records:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-zinc-900">Attendance Logs</h3>
          <p className="text-sm text-zinc-500">Recent activity across the system</p>
        </div>
        <button 
          onClick={fetchRecords}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white border border-dashed border-zinc-200 rounded-2xl p-12 text-center">
          <p className="text-zinc-400 text-sm">No attendance records found yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map((record, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={record.id}
              onClick={() => toggleExpand(record.id)}
              className={`bg-white border transition-all cursor-pointer overflow-hidden ${
                expandedId === record.id 
                  ? 'border-emerald-500 shadow-lg md:col-span-2 ring-1 ring-emerald-500/20' 
                  : 'border-zinc-200 rounded-2xl hover:shadow-md'
              } ${expandedId === record.id ? 'rounded-3xl' : 'rounded-2xl'}`}
            >
              <div className="p-4 flex gap-4">
                <div className={`rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-100 transition-all ${
                  expandedId === record.id ? 'w-24 h-24' : 'w-20 h-20'
                }`}>
                  <img 
                    src={record.image_data} 
                    alt={record.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-zinc-900 truncate">{record.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">
                        {record.employee_id}
                      </span>
                      {expandedId === record.id ? (
                        <ChevronUp className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-[11px]">
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[11px] truncate">{record.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === record.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-zinc-100 bg-zinc-50/50"
                  >
                    <div className="p-6 space-y-6">
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-200 shadow-inner bg-black">
                        <img 
                          src={record.image_data} 
                          alt="Full Preview" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10">
                          <Maximize2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Exact Location</p>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <p className="text-sm text-zinc-700 font-mono leading-relaxed">{record.location}</p>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Timestamp</p>
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-emerald-500 mt-0.5" />
                            <p className="text-sm text-zinc-700 font-medium">
                              {new Date(record.timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              <br />
                              <span className="text-zinc-500">{new Date(record.timestamp).toLocaleTimeString()}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
