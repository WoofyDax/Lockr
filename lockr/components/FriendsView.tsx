import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, ArrowLeft, Clock, 
  Check, X, User, MessageCircle, MoreVertical,
  Sparkles, CheckCircle2, ShieldAlert, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { fetchWithAuth, supabase } from '../lib/supabase';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface FriendProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isFriend?: boolean;
  isRequested?: boolean;
  hasIncomingRequest?: boolean;
  mutualCount?: number;
}

interface FriendRequest {
  id: string;
  fromId: string;
  fromUsername: string;
  timestamp: number;
  profile: FriendProfile;
}

interface FriendsViewProps {
  onBack: () => void;
}

export const FriendsView = ({ onBack }: FriendsViewProps) => {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchFriends = async () => {
    try {
      const res = await fetchWithAuth('/friends');
      if (res.friends) setFriends(res.friends);
      if (res.requests) setRequests(res.requests);
      setAuthError(null);
    } catch (e: any) {
      console.error('Friends fetch failed:', e.message);
      if (e.message.includes('INVALID_JWT') || e.message === 'AUTH_EXPIRED') {
        setAuthError('Your session is out of sync. Please reset it.');
      } else if (e.message !== 'Unauthorized') {
        toast.error('Connection issue. Try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await fetchWithAuth('/friends/suggestions');
      if (res.suggestions) setSuggestions(res.suggestions);
    } catch (e: any) {
      console.warn('Suggestions failed to load:', e.message);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && isMounted) {
        await Promise.all([fetchFriends(), fetchSuggestions()]);
      } else if (isMounted) {
        setLoading(false);
      }
    };
    init();
    return () => { isMounted = false; };
  }, []);

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetchWithAuth(`/users/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.users || []);
    } catch (e: any) {
      console.error('Search failed:', e.message);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const sendFriendRequest = async (username: string) => {
    const toastId = toast.loading('Sending request...');
    try {
      const res = await fetchWithAuth('/friends/request', {
        method: 'POST',
        body: JSON.stringify({ targetUsername: username })
      });
      if (res.error) throw new Error(res.error);
      toast.success('Friend request sent!', { id: toastId });
      
      setSearchResults(prev => prev.map(u => u.username === username ? { ...u, isRequested: true } : u));
      setSuggestions(prev => prev.map(u => u.username === username ? { ...u, isRequested: true } : u));
    } catch (e: any) {
      toast.error(e.message, { id: toastId });
    }
  };

  const respondToRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const res = await fetchWithAuth('/friends/respond', {
        method: 'POST',
        body: JSON.stringify({ requestId, action })
      });
      if (res.error) throw new Error(res.error);
      toast.success(action === 'accept' ? 'Friend added!' : 'Request declined');
      fetchFriends();
      fetchSuggestions();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const resetSession = async () => {
    const { error } = await supabase.auth.signOut();
    localStorage.clear();
    window.location.reload();
  };

  if (authError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
          <ShieldAlert size={48} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white italic">SESSION OUT OF SYNC</h3>
          <p className="text-white/40 text-sm max-w-[250px] mx-auto">We're having trouble verifying your account. A quick reset should fix it!</p>
        </div>
        <button 
          onClick={resetSession}
          className="w-full max-w-[200px] py-4 bg-white text-gray-950 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl"
        >
          <RefreshCw size={20} />
          RESET NOW
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 20 }}
      className="flex-1 flex flex-col space-y-6 pb-20"
    >
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-white/60">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white tracking-tight italic">FRIENDS</h2>
      </header>

      {/* Search Section */}
      <div className="space-y-3">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-hidden focus:border-blue-500/50 transition-all placeholder:text-white/20 font-bold"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Clock className="animate-spin text-blue-400" size={18} />
            </div>
          )}
        </div>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">RESULTS</p>
              {searchResults.map(user => (
                <GlassCard key={user.id} className="p-3 mb-2 flex items-center gap-3 active:scale-[0.98] transition-transform">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 overflow-hidden shrink-0 border border-white/10">
                    <ImageWithFallback src={user.avatarUrl} className="w-full h-full object-cover" alt={user.displayName} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{user.displayName}</p>
                    <p className="text-white/40 text-[10px]">@{user.username}</p>
                  </div>
                  {user.isFriend ? (
                    <div className="px-3 py-1 bg-white/5 rounded-lg text-white/40 text-[10px] font-black uppercase">FRIEND</div>
                  ) : user.isRequested ? (
                    <div className="px-3 py-1 bg-blue-500/10 rounded-lg text-blue-400 text-[10px] font-black uppercase">SENT</div>
                  ) : (
                    <button 
                      onClick={() => sendFriendRequest(user.username)}
                      className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-400 transition-colors flex items-center gap-2 px-4 shadow-lg shadow-blue-500/20"
                    >
                      <UserPlus size={16} />
                      <span className="text-xs font-black uppercase">ADD</span>
                    </button>
                  )}
                </GlassCard>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pending Requests */}
      {requests.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-pulse" />
            REQUESTS
          </p>
          {requests.map(req => (
            <GlassCard key={req.id} className="p-3 flex items-center gap-3 border-fuchsia-500/20 bg-fuchsia-500/5">
              <div className="w-10 h-10 rounded-full bg-fuchsia-500/20 overflow-hidden shrink-0 border border-fuchsia-500/20">
                <ImageWithFallback src={req.profile.avatarUrl} className="w-full h-full object-cover" alt={req.profile.displayName} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{req.profile.displayName}</p>
                <p className="text-white/40 text-[10px]">@{req.profile.username}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => respondToRequest(req.id, 'accept')}
                  className="p-2.5 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/20"
                >
                  <Check size={18} />
                </button>
                <button 
                  onClick={() => respondToRequest(req.id, 'decline')}
                  className="p-2.5 bg-white/10 text-white/60 rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Suggestions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between ml-1">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">SUGGESTIONS</p>
          <Sparkles size={12} className="text-violet-400" />
        </div>
        <div className="grid gap-2">
          {suggestions.length === 0 ? (
            <div className="py-8 text-center bg-white/2 rounded-3xl border border-white/5 space-y-3">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                 <Users size={18} className="text-white/20" />
               </div>
               <p className="text-white/20 text-xs italic">No users found</p>
            </div>
          ) : (
            suggestions.map(user => (
              <GlassCard key={user.id} className="p-3 flex items-center gap-3 bg-white/2">
                <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden shrink-0 border border-white/10">
                  <ImageWithFallback src={user.avatarUrl} className="w-full h-full object-cover" alt={user.displayName} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{user.displayName}</p>
                  <p className="text-white/40 text-[10px]">@{user.username}</p>
                </div>
                
                {user.isRequested ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 rounded-xl">
                    <Clock size={12} className="text-blue-400" />
                    <span className="text-blue-400 text-[10px] font-black uppercase">SENT</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => sendFriendRequest(user.username)}
                    className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all active:scale-90"
                  >
                    <UserPlus size={18} />
                  </button>
                )}
              </GlassCard>
            ))
          )}
        </div>
      </div>

      {/* Friends List */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">MY FRIENDS</p>
        {loading ? (
          <div className="py-10 flex justify-center"><Clock className="animate-spin text-white/20" /></div>
        ) : friends.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-white/5 rounded-[40px] border border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
              <Users size={36} />
            </div>
            <div className="px-8">
              <p className="text-white font-bold mb-1">No friends yet</p>
              <p className="text-white/40 text-sm leading-relaxed">Search for friends to start sharing capsules!</p>
            </div>
          </div>
        ) : (
          friends.map(friend => (
            <GlassCard key={friend.id} className="p-4 flex items-center gap-4 active:scale-[0.98] transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-white/5 overflow-hidden shrink-0 border border-white/10">
                <ImageWithFallback src={friend.avatarUrl} className="w-full h-full object-cover" alt={friend.displayName} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black truncate">{friend.displayName}</p>
                <p className="text-white/40 text-xs">@{friend.username}</p>
              </div>
              <button className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-white/20 hover:text-white/60 transition-colors">
                <MessageCircle size={20} />
              </button>
            </GlassCard>
          ))
        )}
      </div>
    </motion.div>
  );
};