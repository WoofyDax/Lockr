import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Search, Check, Plus, Clock, Sparkles, Loader2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { fetchWithAuth } from '../lib/supabase';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface CreateGroupViewProps {
  onBack: () => void;
  onCreate: (group: any) => void;
}

const UNLOCK_OPTIONS = [
  { label: '1 HOUR', value: 3600000 },
  { label: '12 HOURS', value: 43200000 },
  { label: '24 HOURS', value: 86400000 },
  { label: '1 WEEK', value: 604800000 },
];

export const CreateGroupView = ({ onBack, onCreate }: CreateGroupViewProps) => {
  const [name, setName] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [defaultUnlockTime, setDefaultUnlockTime] = useState(3600000);
  const [customUnlockDate, setCustomUnlockDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetchWithAuth('/friends');
        if (res.friends) setFriends(res.friends);
      } catch (e) {
        console.error('Failed to load friends');
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    const searchGlobal = async () => {
      if (searchQuery.length < 2) {
        setGlobalSearchResults([]);
        return;
      }
      setIsSearchingGlobal(true);
      try {
        const res = await fetchWithAuth(`/users/search?q=${encodeURIComponent(searchQuery)}`);
        setGlobalSearchResults(res.users || []);
      } catch (e) {
        console.error('Global search failed');
      } finally {
        setIsSearchingGlobal(false);
      }
    };

    const timer = setTimeout(searchGlobal, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleFriend = (username: string) => {
    setSelectedFriends(prev => 
      prev.includes(username) 
        ? prev.filter(u => u !== username) 
        : [...prev, username]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for your capsule');
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading('Creating your persistent capsule...');
    
    let customUnlockTimestamp = null;
    if (customUnlockDate) {
      customUnlockTimestamp = new Date(customUnlockDate).getTime();
    }
    
    try {
      const res = await fetchWithAuth('/groups', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          members: selectedFriends,
          defaultUnlockTime,
          customUnlockTimestamp
        })
      });
      
      if (res.error) throw new Error(res.error);
      
      toast.success('Capsule created and synced!', { id: toastId });
      onCreate(res.group);
    } catch (e: any) {
      toast.error('Failed to create capsule: ' + e.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFriends = friends.filter(f => 
    (f.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (f.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 20 }}
      className="flex-1 flex flex-col space-y-6 pb-24"
    >
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-white/60">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">NEW CAPSULE</h2>
      </header>

      <GlassCard className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">CAPSULE NAME</label>
          <div className="relative">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Memories" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-white/20" 
            />
            <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500/40" size={18} />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">UNLOCK TIME</label>
          <div className="grid grid-cols-2 gap-2">
            {UNLOCK_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setDefaultUnlockTime(opt.value); setCustomUnlockDate(''); }}
                className={`py-3 px-2 rounded-xl text-[10px] font-black transition-all border ${
                  defaultUnlockTime === opt.value && !customUnlockDate
                    ? 'bg-blue-500 border-blue-400 text-white shadow-lg' 
                    : 'bg-white/5 border-white/10 text-white/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="relative mt-2">
            <input 
              type="datetime-local" 
              value={customUnlockDate}
              onChange={(e) => { setCustomUnlockDate(e.target.value); setDefaultUnlockTime(0); }}
              className={`w-full bg-white/5 border rounded-xl py-3 px-4 text-xs font-bold focus:outline-none transition-all ${customUnlockDate ? 'border-blue-500 text-white' : 'border-white/10 text-white/20'}`}
            />
            {!customUnlockDate && <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2 text-[10px] font-black text-white/20 uppercase"><Calendar size={14} /> Custom Date</div>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">INVITE FRIENDS</label>
            <span className="text-[10px] font-bold text-blue-400">{selectedFriends.length} SELECTED</span>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
            />
            {isSearchingGlobal && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 className="animate-spin text-blue-400" size={14} /></div>}
          </div>

          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-white/10" /></div>
            ) : (friends.length === 0 && globalSearchResults.length === 0) ? (
              <div className="py-8 text-center bg-white/2 rounded-2xl border border-dashed border-white/10">
                <p className="text-white/20 text-xs italic">No users found.</p>
              </div>
            ) : (
              <>
                {(searchQuery ? [...filteredFriends, ...globalSearchResults.filter(gs => !filteredFriends.find(ff => ff.username === gs.username))] : friends).map(friend => {
                  const isSelected = selectedFriends.includes(friend.username);
                  return (
                    <button 
                      key={friend.id}
                      onClick={() => toggleFriend(friend.username)}
                      className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${isSelected ? 'bg-blue-500/20 border-blue-500/30' : 'bg-white/2 border-white/5'} border`}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden shrink-0 border border-white/10">
                        <ImageWithFallback src={friend.avatarUrl} className="w-full h-full object-cover" alt={friend.displayName} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-white font-bold text-sm truncate">{friend.displayName}</p>
                        <p className="text-white/40 text-[10px]">@{friend.username}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 text-white scale-110' : 'bg-white/5 text-transparent'}`}>
                        <Check size={14} strokeWidth={4} />
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        <button 
          onClick={handleCreate}
          disabled={isSubmitting || !name.trim()}
          className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl uppercase active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
            isSubmitting || !name.trim() ? 'bg-white/5 text-white/20' : 'bg-white text-gray-950'
          }`}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <><Plus size={20} strokeWidth={3} /> CREATE CAPSULE</>}
        </button>
      </GlassCard>
    </motion.div>
  );
};