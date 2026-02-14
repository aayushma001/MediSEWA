
import React, { useState, useEffect } from 'react';
import { Monitor, X, Copy, Check, Loader2, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyJoinProps {
  roomUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const DailyJoin: React.FC<DailyJoinProps> = ({ roomUrl, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = () => {
    setIsJoining(true);
    // Open Daily.co room in new tab
    window.open(roomUrl, '_blank');
    setTimeout(() => {
      setIsJoining(false);
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-slate-500 z-10 transition-all">
          <X size={20}/>
        </button>

        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <Video size={40} className="text-white"/>
          </div>
          
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-2">Video Consultation</p>
          <h3 className="text-2xl font-black text-slate-800 mb-6">Join Daily Video Call</h3>
          
          <p className="text-sm text-slate-500 mb-8">
            Click below to join your video consultation. You'll be redirected to Daily.co in a new tab.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Meeting Link</p>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-slate-600 truncate flex-1">{roomUrl}</p>
              <button 
                onClick={handleCopy}
                className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                {copied ? <Check size={16} className="text-green-500"/> : <Copy size={16} className="text-slate-400"/>}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleJoin}
              disabled={isJoining}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isJoining ? (
                <Loader2 size={20} className="animate-spin"/>
              ) : (
                <>
                  <Monitor size={20}/> Join Call
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-6">
            No app needed - works in browser
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default DailyJoin;
