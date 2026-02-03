import React, { useState, useEffect } from 'react';
import { 
  Lock, Unlock, Clock, Plus, Users, Bell, ArrowLeft, LogOut, Loader2, UserPlus, RefreshCw, ChevronRight, PlayCircle, Trash2, Download, Filter, Camera, Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AuthScreen } from './AuthScreen';
import { NotificationsView } from './NotificationsView';
import { FriendsView } from './FriendsView';
import { CreateGroupView } from './CreateGroupView';
import { AddMembersView } from './AddMembersView';
import { SettingsView } from './SettingsView';
import { LiquidLoader } from './LiquidLoader';
import { BottomNav } from './BottomNav';
import { CameraView } from './CameraView';
import { PhotoPreview } from './PhotoPreview';
import { supabase, fetchWithAuth } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { useTheme } from '../lib/theme';

// --- Types ---
interface Photo {
  id: string;
  url: string;
  type: 'image' | 'video';
  unlockTime: number;
  author: string;
  authorUsername: string;
  caption: string;
  timestamp: number;
  mirrored?: boolean;
}

interface Group {
  id: string;
  name: string;
  creatorId: string;
  memberUsernames: string[];
  lastActive: string;
  photos: Photo[];
  defaultUnlockTime?: number;
  unlockTimestamp?: number;
}

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  email?: string;
}

type View = 'AUTH' | 'HOME' | 'CAMERA' | 'GROUP_DETAIL' | 'CREATE_GROUP' | 'PREVIEW' | 'SETTINGS' | 'NOTIFICATIONS' | 'FRIENDS' | 'ADD_MEMBERS';
type FilterMode = 'all' | 'locked' | 'unlocked';

export const LockrMain = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [view, setView] = useState<View>('AUTH');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [homeFilter, setHomeFilter] = useState<FilterMode>('all');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [previousView, setPreviousView] = useState<View>('HOME'); // Track where camera was opened from

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to determine the absolute unlock time for a group
  const getGroupUnlockTime = (group: Group) => {
    // Priority 1: The group-wide synchronized unlock timestamp
    if (group.unlockTimestamp) return Number(group.unlockTimestamp);
    
    // Priority 2: Fallback to the latest photo unlock time (for legacy data)
    if (group.photos && group.photos.length > 0) {
      const times = group.photos.map(p => Number(p.unlockTime));
      return Math.max(...times);
    }
    
    // Priority 3: If truly empty and no sync time (shouldn't happen for new groups), 
    // we return a far-future date or 0? 0 makes it unlocked. 
    // Let's assume new groups ALWAYS have an unlockTimestamp now.
    return 0;
  };

  const fetchGroups = async () => {
    if (!user) return;
    setGroupsLoading(true);
    try {
      // Ensure we have a valid session before attempting to fetch
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No active session found when fetching groups');
        setGroupsLoading(false);
        return;
      }
      
      const res = await fetchWithAuth('/groups');
      if (res.groups) {
        // Normalize all dates to numbers once at the edge
        const normalized = res.groups.map((g: any) => ({
          ...g,
          // Handle both ISO strings and numeric timestamps
          unlockTimestamp: g.unlockTimestamp ? (typeof g.unlockTimestamp === 'number' ? g.unlockTimestamp : new Date(g.unlockTimestamp).getTime()) : undefined,
          photos: g.photos?.map((p: any) => ({
            ...p,
            unlockTime: typeof p.unlockTime === 'number' ? p.unlockTime : new Date(p.unlockTime).getTime(),
            timestamp: typeof p.timestamp === 'number' ? p.timestamp : new Date(p.timestamp).getTime()
          })) || []
        }));
        setGroups(normalized);
      }
    } catch (e: any) {
      console.error('Failed to fetch groups', e);
      // If auth expired, redirect to login
      if (e.message === 'AUTH_EXPIRED' || e.message === 'INVALID_JWT_PERSISTENT') {
        toast.error('Session expired. Please log in again.');
        await supabase.auth.signOut();
        setUser(null);
        setView('AUTH');
      }
    } finally {
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const metadata = session.user.user_metadata;
          
          // Load saved profile data from localStorage
          const savedAvatar = localStorage.getItem('lockr_avatar');
          const savedName = localStorage.getItem('lockr_display_name');
          
          setUser({
            id: session.user.id,
            name: savedName || metadata.name || session.user.email?.split('@')[0] || 'User',
            username: metadata.username || 'user',
            avatar: savedAvatar || metadata.avatar_url,
            email: session.user.email
          });
          setView('HOME');
          await fetchGroups();
        } else {
          setView('AUTH');
        }
      } catch (e) {
        console.error('Auth check error', e);
        setView('AUTH');
      } finally {
        setAuthLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata;
        
        // Load saved profile data from localStorage
        const savedAvatar = localStorage.getItem('lockr_avatar');
        const savedName = localStorage.getItem('lockr_display_name');
        
        setUser({
          id: session.user.id,
          name: savedName || metadata.name || session.user.email?.split('@')[0] || 'User',
          username: metadata.username || 'user',
          avatar: savedAvatar || metadata.avatar_url,
          email: session.user.email
        });
        if (view === 'AUTH') setView('HOME');
      } else if (event === 'SIGNED_OUT') {
        // Clear saved profile data on logout
        localStorage.removeItem('lockr_avatar');
        localStorage.removeItem('lockr_display_name');
        setUser(null);
        setView('AUTH');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && (view === 'HOME' || view === 'GROUP_DETAIL')) {
      fetchGroups();
    }
  }, [user, view]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('AUTH');
    setSelectedGroupId(null);
  };

  const handleCreateGroup = (newGroup: any) => {
    setGroups(prev => [newGroup, ...prev]);
    setView('HOME');
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this capsule? This cannot be undone.')) return;
    const toastId = toast.loading('Destroying capsule...');
    try {
      const res = await fetchWithAuth(`/groups/${id}`, { method: 'DELETE' });
      if (res.error) throw new Error(res.error);
      toast.success('Capsule deleted forever', { id: toastId });
      setGroups(prev => prev.filter(g => g.id !== id));
      setView('HOME');
    } catch (e: any) {
      toast.error(e.message, { id: toastId });
    }
  };

  const handlePostPhotoSuccess = () => {
    setCapturedMedia(null);
    setView('HOME');
    fetchGroups();
  };

  const handleDownload = (url: string, type: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `lockr_moment_${Date.now()}.${type === 'image' ? 'jpg' : 'webm'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Saved to device!');
  };

  if (authLoading) return <LiquidLoader />;

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const filteredPhotos = selectedGroup?.photos || [];

  const renderView = () => {
    if (view === 'AUTH' && !user) {
      return (
        <AuthScreen key="auth" onAuthSuccess={(u) => {
          const metadata = u.user_metadata;
          setUser({ id: u.id, name: metadata.name || u.email?.split('@')[0], username: metadata.username || 'user', avatar: metadata.avatar_url, email: u.email });
          setView('HOME');
        }} />
      );
    }

    switch (view) {
      case 'HOME':
        return (
          <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6 flex-1 pb-24">
            <header className="flex items-center justify-between py-2 relative">
              <div className="absolute left-1/2 -translate-x-1/2">
                <h1 className="text-2xl font-black text-white leading-tight tracking-tighter italic uppercase">LOCKR</h1>
              </div>
              <motion.button onClick={fetchGroups} className="p-2.5 bg-white/5 rounded-full text-white/40" whileTap={{ rotate: 180 }}>
                <RefreshCw size={18} className={groupsLoading ? 'animate-spin' : ''} />
              </motion.button>
              <div className="flex gap-2">
                <motion.button onClick={() => setView('NOTIFICATIONS')} className="p-2.5 bg-white/5 rounded-full text-white/60 relative" whileTap={{ scale: 0.9 }}>
                  <Bell size={20} />
                  {hasUnreadNotifications && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1 w-2 h-2 bg-fuchsia-500 rounded-full border border-[#0f0a1e]" />}
                </motion.button>
              </div>
            </header>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="cursor-pointer active:scale-95 transition-transform" onClick={() => setView('CREATE_GROUP')}>
              <GlassCard className="p-5 flex items-center gap-4 border-dashed border-white/20 bg-white/5" hoverable={false}>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/10"><Plus size={24} /></div>
                <div><span className="text-white font-bold block">New Capsule</span><span className="text-white/40 text-[10px] uppercase font-black">START A TIME CAPSULE</span></div>
              </GlassCard>
            </motion.div>

            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 mb-2">
                {(['all', 'locked', 'unlocked'] as FilterMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setHomeFilter(mode)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      homeFilter === mode ? 'bg-white text-violet-950 shadow-lg' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
            </div>

            <div className="space-y-3">
              {groupsLoading && groups.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-white/20">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Waking up the server...</p>
                </div>
              ) : groups.length === 0 ? (
                <div className="py-20 text-center space-y-4 bg-white/2 rounded-[40px] border border-white/5">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10"><Users size={32} /></div>
                  <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] px-10">Your persistent shared moments will appear here</p>
                </div>
              ) : (
                groups
                  .map(group => {
                    const unlockAt = getGroupUnlockTime(group);
                    const isLocked = unlockAt > currentTime;
                    return { ...group, isLocked, unlockAt };
                  })
                  .filter(group => {
                    if (homeFilter === 'locked') return group.isLocked;
                    if (homeFilter === 'unlocked') return !group.isLocked;
                    return true;
                  })
                  .sort((a, b) => {
                    // Locked First
                    if (a.isLocked && !b.isLocked) return -1;
                    if (!a.isLocked && b.isLocked) return 1;
                    // Soonest to unlock on top within Locked
                    if (a.isLocked && b.isLocked) return a.unlockAt - b.unlockAt;
                    return 0;
                  })
                  .map((group, index) => {
                    const diff = group.unlockAt - currentTime;
                    return (
                      <motion.div key={group.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + index * 0.05 }} onClick={() => { setSelectedGroupId(group.id); setView('GROUP_DETAIL'); }} className="cursor-pointer">
                        <GlassCard className={`p-4 flex items-center gap-4 group relative overflow-hidden ${group.isLocked ? 'border-fuchsia-500/30' : 'border-green-500/10'}`}>
                          <div className="w-16 h-16 rounded-3xl overflow-hidden bg-white/5 border border-white/10 shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center relative">
                            {group.photos && group.photos.length > 0 ? (
                              <>
                                <ImageWithFallback src={group.photos[0].url} className={`w-full h-full object-cover ${group.isLocked ? 'blur-md brightness-50' : ''}`} alt={group.name} />
                                {group.isLocked ? (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <Lock className="text-white/60" size={20} />
                                  </div>
                                ) : (
                                  <div className="absolute top-1 right-1 bg-green-500/80 p-1 rounded-full border border-white/20">
                                    <Unlock className="text-white" size={10} />
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-violet-500/10 text-violet-400">
                                {group.isLocked ? <Lock size={24} /> : <Users size={24} />}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-bold text-lg truncate">{group.name}</h3>
                              {group.isLocked && (
                                <div className="bg-fuchsia-500 p-1 rounded-md animate-pulse">
                                  <Clock size={10} className="text-white" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col mt-0.5">
                              <p className="text-white/40 text-[10px] font-black uppercase">{(group.photos?.length || 0)} MOMENTS • {group.lastActive}</p>
                              
                              {group.isLocked ? (
                                <div className="mt-1.5 flex flex-col gap-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-fuchsia-400 text-sm font-black tabular-nums">
                                      {(() => {
                                        if (diff <= 0) return 'UNSEALING...';
                                        const h = Math.floor(diff / 3600000);
                                        const m = Math.floor((diff % 3600000) / 60000);
                                        const s = Math.floor((diff % 60000) / 1000);
                                        return `${h}h ${m}m ${s}s`;
                                      })()}
                                    </span>
                                    <span className="text-[8px] text-white/30 uppercase font-black tracking-widest">UNTIL REVEAL</span>
                                  </div>
                                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                     <motion.div 
                                      className="h-full bg-linear-to-r from-violet-500 to-fuchsia-500"
                                      initial={{ width: '0%' }}
                                      animate={{ width: '100%' }}
                                      transition={{ duration: Math.max(0.1, diff / 1000), ease: 'linear' }}
                                     />
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1 flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                  <span className="text-[9px] text-green-400 font-black uppercase tracking-widest">OPEN & VIEWABLE</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white/60 transition-colors"><ChevronRight size={18} /></div>
                        </GlassCard>
                      </motion.div>
                    );
                  })
              )}
            </div>
          </motion.div>
        );
      case 'CAMERA': return <CameraView key="camera" onCapture={(media) => { setCapturedMedia(media); setView('PREVIEW'); }} onClose={() => setView(previousView)} />;
      case 'PREVIEW': return capturedMedia ? (
        <PhotoPreview 
          key="preview" 
          media={capturedMedia} 
          groups={groups} 
          onSend={handlePostPhotoSuccess} 
          onRetake={() => { setCapturedMedia(null); setView('CAMERA'); }}
          preSelectedGroupId={previousView === 'GROUP_DETAIL' ? selectedGroupId || undefined : undefined}
        />
      ) : null;
      case 'CREATE_GROUP': return <CreateGroupView key="create" onBack={() => setView('HOME')} onCreate={handleCreateGroup} />;
      case 'ADD_MEMBERS': return selectedGroup ? (
        <AddMembersView 
          key="add-members" 
          groupId={selectedGroup.id} 
          existingMemberUsernames={selectedGroup.memberUsernames} 
          onBack={() => setView('GROUP_DETAIL')} 
          onSuccess={() => { setView('GROUP_DETAIL'); fetchGroups(); }} 
        />
      ) : null;
      case 'FRIENDS': return <FriendsView key="friends" onBack={() => setView('HOME')} />;
      case 'NOTIFICATIONS': return <NotificationsView key="notif" onBack={() => setView('HOME')} />;
      case 'SETTINGS': return (
        <SettingsView 
          key="settings" 
          user={user} 
          onBack={() => setView('HOME')} 
          onNavigateToFriends={() => setView('FRIENDS')} 
          onNavigateToNotifications={() => setView('NOTIFICATIONS')}
          onLogout={handleLogout}
          onUpdateUser={(updates) => {
            if (user) {
              setUser({
                ...user,
                name: updates.name || user.name,
                username: updates.username || user.username,
                avatar: updates.avatar || user.avatar
              });
            }
          }}
        />
      );
      case 'GROUP_DETAIL':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex-1 pb-24">
             <header className="flex items-center justify-between relative py-2">
                <button onClick={() => setView('HOME')} className="p-2 text-white/60"><ArrowLeft size={24} /></button>
                <div className="absolute left-1/2 -translate-x-1/2 max-w-[150px]">
                  <h2 className="text-sm font-black text-white tracking-tight italic uppercase truncate">{selectedGroup?.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setView('ADD_MEMBERS')} className="p-3 bg-white/5 text-white/60 rounded-2xl hover:bg-white/10 transition-colors">
                    <UserPlus size={18} />
                  </button>
                  {selectedGroup?.creatorId === user?.id && (
                    <button onClick={() => handleDeleteGroup(selectedGroup.id)} className="p-3 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500/20 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
             </header>

             <div className="grid grid-cols-2 gap-4 pb-32">
                {filteredPhotos && filteredPhotos.map(p => {
                  const isUnlocked = currentTime > p.unlockTime;
                  const timeRemaining = p.unlockTime - currentTime;
                  const hours = Math.floor(timeRemaining / 3600000);
                  const mins = Math.floor((timeRemaining % 3600000) / 60000);

                  return (
                    <div key={p.id} className="aspect-square rounded-[32px] overflow-hidden relative group border border-white/10 bg-white/5">
                      <ImageWithFallback 
                        src={p.url} 
                        className={`w-full h-full object-cover transition-all duration-500 ${isUnlocked ? '' : 'blur-xl scale-110 brightness-50'}`} 
                        style={{ transform: p.mirrored ? 'scaleX(-1)' : 'none' }}
                      />
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 p-4 text-center">
                         {!isUnlocked ? (
                           <>
                             <Lock className="text-white/40 mb-2 animate-pulse" size={32} />
                             <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">LOCKED</span>
                             <div className="flex items-center gap-1 mt-1 text-fuchsia-400">
                               <Clock size={10} />
                               <span className="text-[10px] font-black">{hours}h {mins}m</span>
                             </div>
                           </>
                         ) : (
                           <>
                             <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full text-white/80">
                               <Unlock size={14} />
                             </div>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleDownload(p.url, p.type); }}
                                className="absolute top-2 right-2 bg-white/10 backdrop-blur-md p-1.5 rounded-full text-white/80 hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                             >
                               <Download size={14} />
                             </button>
                             {p.type === 'video' && <PlayCircle className="text-white/80" size={32} />}
                           </>
                         )}
                      </div>
                      
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white/60 font-black truncate uppercase bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">@{p.authorUsername}</p>
                      </div>
                    </div>
                  );
                })}
                {(!filteredPhotos || filteredPhotos.length === 0) && (
                  <div className="col-span-2 py-20 text-center bg-white/2 rounded-[40px] border border-white/5">
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest italic">No moments found</p>
                  </div>
                )}
             </div>

             {/* Large Centered Floating Camera Button */}
             <motion.button
               onClick={() => {
                 setCapturedMedia(null);
                 setView('CAMERA');
                 setPreviousView('GROUP_DETAIL');
               }}
               className="fixed bottom-28 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full shadow-2xl flex items-center justify-center text-white z-50 hover:scale-110 active:scale-95 transition-transform select-none touch-none"
               style={{ WebkitTapHighlightColor: 'transparent' }}
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.95 }}
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
             >
               <Camera size={32} />
               <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 opacity-0 group-hover:opacity-50 animate-pulse" />
             </motion.button>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 max-w-lg mx-auto pb-safe">
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
      {user && view !== 'CAMERA' && view !== 'PREVIEW' && (
        <BottomNav activeView={view === 'GROUP_DETAIL' ? 'HOME' : view} onNavigate={(v: any) => setView(v)} hasUnreadNotifications={hasUnreadNotifications} />
      )}
    </div>
  );
};