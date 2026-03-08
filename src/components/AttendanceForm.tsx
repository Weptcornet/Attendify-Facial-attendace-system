import React, { useState, useEffect } from 'react';
import { User, MapPin, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

interface UserData {
  id: number;
  name: string;
  employee_id: string;
}

interface AttendanceFormProps {
  capturedImage: string | null;
  onSuccess: () => void;
  onReset: () => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({ capturedImage, onSuccess, onReset }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [location, setLocation] = useState<string>('Detecting location...');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Error fetching users:", err));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => setLocation('Location access denied')
      );
    } else {
      setLocation('Geolocation not supported');
    }
  }, []);

  // Automatic Mapping (Identification) using Gemini
  useEffect(() => {
    if (capturedImage && users.length > 0 && !selectedUserId && !isIdentifying) {
      identifyUser();
    }
  }, [capturedImage, users]);

  const identifyUser = async () => {
    if (!capturedImage || users.length === 0) return;

    setIsIdentifying(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = capturedImage.split(',')[1];
      
      const userListStr = users.map(u => `${u.id}: ${u.name} (${u.employee_id})`).join('\n');
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
              { text: `Identify the person in this image from the following list of users. Return ONLY the ID number of the person if you are confident (score > 0.8), otherwise return "unknown".\n\nUsers:\n${userListStr}` }
            ]
          }
        ],
      });

      const result = response.text?.trim().toLowerCase();
      if (result && !isNaN(parseInt(result))) {
        const matchedUser = users.find(u => u.id === parseInt(result));
        if (matchedUser) {
          setSelectedUserId(result);
          setAiSuggestion(matchedUser.name);
        }
      }
    } catch (err) {
      console.error("AI Identification error:", err);
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !capturedImage) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(selectedUserId),
          image_data: capturedImage,
          location: location
        })
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onSuccess();
          onReset();
          setStatus('idle');
          setSelectedUserId('');
          setAiSuggestion(null);
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error("Submit error:", err);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!capturedImage) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200 mt-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Attendance Mapping</h3>
            <p className="text-xs text-zinc-500">Confirm details to save record</p>
          </div>
        </div>
        
        <AnimatePresence>
          {isIdentifying && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100"
            >
              <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">AI Identifying...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Select Employee / Student</span>
            {aiSuggestion && (
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI Suggested: {aiSuggestion}
              </span>
            )}
          </label>
          <div className="relative">
            <select
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className={`w-full bg-zinc-50 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none appearance-none transition-all ${
                aiSuggestion && selectedUserId ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-zinc-200'
              }`}
            >
              <option value="">Choose a person...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.employee_id})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <User className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
            Current Location
          </label>
          <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-zinc-700 font-mono">{location}</span>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex-1 px-4 py-3 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Retake Photo
          </button>
          <button
            type="submit"
            disabled={isSubmitting || status === 'success'}
            className={`flex-[2] px-4 py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 ${
              status === 'success' ? 'bg-emerald-500' : 'bg-zinc-900 hover:bg-zinc-800'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Success
              </>
            ) : (
              'Submit Attendance'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
