import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Users, LogOut, Palette, Camera, Edit, 
  Bell, Lock, Shield, Info, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useTheme } from '../lib/theme';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../lib/supabase';

const PRIVACY_KEY = 'lockr_privacy_searchable';

interface SettingsViewProps {
  user: { name: string; username: string; avatar?: string } | null;
  onBack: () => void;
  onNavigateToFriends: () => void;
  onNavigateToNotifications?: () => void;
  onLogout: () => void;
  onUpdateUser?: (updates: { name?: string; username?: string; avatar?: string }) => void;
}

export const SettingsView = ({ user, onBack, onNavigateToFriends, onNavigateToNotifications, onLogout, onUpdateUser }: SettingsViewProps) => {
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [searchable, setSearchable] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRIVACY_KEY);
      setSearchable(stored !== 'false');
    } catch {
      setSearchable(true);
    }
  }, []);

  const handlePrivacyToggle = (value: boolean) => {
    setSearchable(value);
    localStorage.setItem(PRIVACY_KEY, String(value));
    toast.success(value ? 'You are searchable by username' : 'You are hidden from search');
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    const toastId = toast.loading('Updating password...');
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated!', { id: toastId });
      setShowChangePassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update password', { id: toastId });
    } finally {
      setChangingPassword(false);
    }
  };
  
  const gradientClass = `bg-linear-to-br ${theme.gradientFrom} ${theme.gradientTo}`;
  
  const handleThemeToggle = () => {
    toggleTheme();
    toast.success(`Switched to ${theme.mode === 'cool' ? 'warm' : 'cool'} theme!`, {
      icon: theme.mode === 'cool' ? '🔥' : '❄️'
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading profile picture...');

    try {
      // Convert to base64 for temporary storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        // Update locally
        onUpdateUser?.({ avatar: base64String });
        
        // Store in localStorage for persistence
        localStorage.setItem('lockr_avatar', base64String);
        
        toast.success('Profile picture updated!', { id: toastId });
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read image', { id: toastId });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image', { id: toastId });
      setUploading(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!newName.trim() || newName === user?.name) {
      setEditingName(false);
      return;
    }

    const toastId = toast.loading('Updating name...');
    try {
      // Update locally
      onUpdateUser?.({ name: newName.trim() });
      
      // Store in localStorage for persistence
      localStorage.setItem('lockr_display_name', newName.trim());
      
      toast.success('Name updated!', { id: toastId });
      setEditingName(false);
    } catch (error: any) {
      toast.error('Failed to update name', { id: toastId });
    }
  };

  return (
    <motion.div 
      key="settings" 
      initial={{ opacity: 0, x: -50 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -50 }} 
      className="space-y-8 flex-1 pb-24 w-full overflow-x-hidden"
    >
      <header className="flex items-center justify-between relative py-2">
        <button onClick={onBack} className="p-2 text-white/60 shrink-0">
          <ArrowLeft size={24} />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2">
          <h2 className="text-sm font-black text-white tracking-tight italic uppercase">PROFILE</h2>
        </div>
        <div className="w-10 shrink-0" />
      </header>
      
      <div className="text-center py-6 space-y-4">
        <div className="relative w-28 h-28 mx-auto">
          <div className={`w-full h-full rounded-[40px] ${gradientClass} flex items-center justify-center text-4xl font-black text-white shadow-2xl overflow-hidden border-4 border-white/10`}>
            {user?.avatar ? (
              <ImageWithFallback src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
            ) : (
              user?.name[0].toUpperCase()
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 p-3 bg-blue-500 text-white rounded-2xl shadow-lg hover:bg-blue-400 transition-all disabled:opacity-50 active:scale-90"
          >
            <Camera size={18} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>
        <div>
          {editingName ? (
            <div className="flex items-center justify-center gap-2 mb-2">
              <input 
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleNameUpdate}
                onKeyPress={(e) => e.key === 'Enter' && handleNameUpdate()}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-bold text-center"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-2xl font-black text-white italic tracking-tight">{user?.name}</h3>
              <button 
                onClick={() => setEditingName(true)}
                className="p-1.5 bg-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/20 transition-all"
              >
                <Edit size={16} />
              </button>
            </div>
          )}
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">@{user?.username}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">APPEARANCE</p>
        
        <button onClick={handleThemeToggle} className="w-full text-left">
          <GlassCard className="p-4 flex items-center gap-4">
            <div className={`w-10 h-10 ${gradientClass} rounded-xl flex items-center justify-center text-white shadow-lg`}>
              <Palette size={18} />
            </div>
            <div className="flex-1">
              <span className="text-white font-bold uppercase tracking-tighter italic block">THEME</span>
              <span className="text-white/40 text-[10px] font-black uppercase">
                {theme.mode === 'cool' ? 'Cool (Blue/Cyan)' : 'Warm (Orange/Rose)'}
              </span>
            </div>
            <div className="flex gap-1">
              <div className={`w-6 h-6 rounded-full ${theme.mode === 'cool' ? 'bg-blue-500' : 'bg-white/20'} transition-all`} />
              <div className={`w-6 h-6 rounded-full ${theme.mode === 'warm' ? 'bg-orange-500' : 'bg-white/20'} transition-all`} />
            </div>
          </GlassCard>
        </button>

        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 pt-4">SOCIAL</p>
        
        <button onClick={onNavigateToFriends} className="w-full text-left">
          <GlassCard className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/60">
              <Users size={18} />
            </div>
            <span className="text-white font-bold flex-1 uppercase tracking-tighter italic">FRIENDS LIST</span>
          </GlassCard>
        </button>

        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 pt-4">PRIVACY & SECURITY</p>

        <button className="w-full text-left" onClick={() => onNavigateToNotifications?.()}>
          <GlassCard className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/60">
              <Bell size={18} />
            </div>
            <div className="flex-1">
              <span className="text-white font-bold uppercase tracking-tighter italic block">NOTIFICATIONS</span>
              <span className="text-white/40 text-[10px] font-black uppercase">Push & Sound</span>
            </div>
          </GlassCard>
        </button>

        <button className="w-full text-left" onClick={() => setShowPrivacy(true)}>
          <GlassCard className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/60">
              <Shield size={18} />
            </div>
            <div className="flex-1">
              <span className="text-white font-bold uppercase tracking-tighter italic block">PRIVACY</span>
              <span className="text-white/40 text-[10px] font-black uppercase">Who can find you</span>
            </div>
          </GlassCard>
        </button>

        <button className="w-full text-left" onClick={() => setShowChangePassword(true)}>
          <GlassCard className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/60">
              <Lock size={18} />
            </div>
            <div className="flex-1">
              <span className="text-white font-bold uppercase tracking-tighter italic block">CHANGE PASSWORD</span>
              <span className="text-white/40 text-[10px] font-black uppercase">Update credentials</span>
            </div>
          </GlassCard>
        </button>

        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 pt-4">ABOUT</p>

        <button className="w-full text-left">
          <GlassCard className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/60">
              <Info size={18} />
            </div>
            <div className="flex-1">
              <span className="text-white font-bold uppercase tracking-tighter italic block">ABOUT</span>
              <span className="text-white/40 text-[10px] font-black uppercase">Version 1.0.0</span>
            </div>
          </GlassCard>
        </button>
        
        <button onClick={onLogout} className="w-full text-left mt-6">
          <GlassCard className="p-4 flex items-center gap-4 border-red-500/20 bg-red-500/5">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400">
              <LogOut size={18} />
            </div>
            <span className="text-red-400 font-bold flex-1 uppercase tracking-tighter italic">SIGN OUT</span>
          </GlassCard>
        </button>
      </div>

      <AnimatePresence>
        {showPrivacy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPrivacy(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f0a1e] border border-white/10 rounded-3xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Privacy</h3>
                <button onClick={() => setShowPrivacy(false)} className="p-2 text-white/60"><X size={20} /></button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white font-bold text-sm">Searchable by username</span>
                <button
                  onClick={() => handlePrivacyToggle(!searchable)}
                  className={`w-12 h-7 rounded-full transition-colors ${searchable ? 'bg-violet-500' : 'bg-white/20'}`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow"
                    animate={{ x: searchable ? 22 : 4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                </button>
              </div>
              <p className="text-white/40 text-xs mt-3">When on, others can find you when searching by username.</p>
            </motion.div>
          </motion.div>
        )}
        {showChangePassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !changingPassword && setShowChangePassword(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f0a1e] border border-white/10 rounded-3xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Change password</h3>
                <button onClick={() => !changingPassword && setShowChangePassword(false)} className="p-2 text-white/60" disabled={changingPassword}><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={changingPassword || !newPassword || !confirmPassword}
                className="w-full mt-4 py-3 bg-white text-gray-950 rounded-xl font-black uppercase disabled:opacity-50"
              >
                {changingPassword ? 'Updating...' : 'Update password'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};