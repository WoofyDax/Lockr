import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Check, Plus, Loader2, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from './GlassCard';
import { fetchWithAuth } from '../lib/supabase';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface AddMembersViewProps {
  groupId: string;
  existingMemberUsernames: string[];
  onBack: () => void;
  onSuccess: () => void;
}

export const AddMembersView = ({ groupId, existingMemberUsernames, onBack, onSuccess }: AddMembersViewProps) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetchWithAuth('/friends');
        if (res.friends) {
          // Filter out friends already in the group
          const availableFriends = res.friends.filter((f: any) => !existingMemberUsernames.includes(f.username));
          setFriends(availableFriends);
        }
      } catch (e) {
        console.error('Failed to load friends');
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [existingMemberUsernames]);

  const toggleFriend = (username: string) => {
    setSelectedFriends(prev => 
      prev.includes(username) 
        ? prev.filter(u => u !== username) 
        : [...prev, username]
    );
  };

  const handleAdd = async () => {
    if (selectedFriends.length === 0) return;
    
    setIsSubmitting(true);
    const toastId = toast.loading('Inviting friends...');
    
    try {
      const res = await fetchWithAuth(`/groups/${groupId}/members`, {
        method: 'POST',
        body: JSON.stringify({ usernames: selectedFriends })
      });
      
      if (res.error) throw new Error(res.error);
      
      toast.success('Friends added to the capsule!', { id: toastId });
      onSuccess();
    } catch (e: any) {
      toast.error(e.message, { id: toastId });
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
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 20 }}
      className="flex-1 flex flex-col space-y-6 pb-24"
    >
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-white/60">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">ADD FRIENDS</h2>
      </header>

      <GlassCard className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">SELECT NEW MEMBERS</label>
            <span className="text-[10px] font-bold text-blue-400">{selectedFriends.length} SELECTED</span>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your friends..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
            />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-white/10" /></div>
            ) : friends.length === 0 ? (
              <div className="py-8 text-center bg-white/2 rounded-2xl border border-dashed border-white/10">
                <Users size={32} className="mx-auto text-white/5 mb-2" />
                <p className="text-white/20 text-xs italic px-6">Everyone on your friends list is already in this capsule!</p>
              </div>
            ) : (
              filteredFriends.map(friend => {
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
              })
            )}
          </div>
        </div>

        <button 
          onClick={handleAdd}
          disabled={isSubmitting || selectedFriends.length === 0}
          className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl uppercase active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
            isSubmitting || selectedFriends.length === 0 ? 'bg-white/5 text-white/20' : 'bg-white text-gray-950'
          }`}
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <><Plus size={20} strokeWidth={3} /> ADD TO CAPSULE</>}
        </button>
      </GlassCard>
    </motion.div>
  );
};