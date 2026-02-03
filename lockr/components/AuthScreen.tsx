import React, { useState, useEffect } from 'react';
import { 
  Lock, Mail, Phone, User, Key, ArrowRight,
  Eye, EyeOff, Loader2, Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { supabase, fetchWithAuth } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useTheme } from '../lib/theme';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

export const AuthScreen = ({ onAuthSuccess }: AuthScreenProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingAvatar) {
      toast.error('Please wait for profile picture to finish uploading');
      return;
    }
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up through our server to handle metadata and KV store
        await fetchWithAuth('/signup', {
          method: 'POST',
          body: JSON.stringify({
            email: authMethod === 'email' ? email : undefined,
            phone: authMethod === 'phone' ? phone : undefined,
            password,
            username: username.replace('@', ''),
            displayName,
            avatarUrl
          })
        });

        toast.success('Account created! Logging you in...');
        
        // After server signup, sign in normally to get session
        const signInParams = authMethod === 'email' 
          ? { email, password } 
          : { phone, password };

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword(signInParams);

        if (signInError) throw signInError;
        
        // Wait a moment for the session to be fully persisted
        await new Promise(resolve => setTimeout(resolve, 500));
        
        onAuthSuccess(signInData.user);
      } else {
        // Normal sign in
        const signInParams = authMethod === 'email' 
          ? { email, password } 
          : { phone, password };

        const { data, error } = await supabase.auth.signInWithPassword(signInParams);

        if (error) throw error;
        
        // Wait a moment for the session to be fully persisted
        await new Promise(resolve => setTimeout(resolve, 500));
        
        onAuthSuccess(data.user);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingAvatar(true);
    const toastId = toast.loading('Uploading profile picture...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      formData.append('path', fileName);

      const response = await fetchWithAuth('/upload', {
        method: 'POST',
        body: formData,
        headers: {} 
      });

      if (response.error) throw new Error(response.error);

      setAvatarUrl(response.url);
      toast.success('Profile picture uploaded!', { id: toastId });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image: ' + error.message, { id: toastId });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const { theme } = useTheme();
  
  // Dynamic color classes
  const gradientClass = `bg-linear-to-br ${theme.gradientFrom} ${theme.gradientTo}`;
  const accentClass = theme.mode === 'cool' ? 'text-blue-400' : 'text-orange-400';
  const accentBgClass = theme.mode === 'cool' ? 'bg-blue-600' : 'bg-orange-600';
  const accentBgHoverClass = theme.mode === 'cool' ? 'hover:bg-blue-500' : 'hover:bg-orange-500';
  const accentBorderClass = theme.mode === 'cool' ? 'focus:border-blue-500/50' : 'focus:border-orange-500/50';
  const textGradientClass = theme.mode === 'cool' 
    ? 'from-white via-blue-200 to-cyan-200'
    : 'from-white via-orange-200 to-rose-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex-1 flex flex-col justify-center py-10 px-2"
    >
      <div className="text-center space-y-4 mb-8">
        <motion.div 
          className={`w-20 h-20 ${gradientClass} rounded-3xl mx-auto flex items-center justify-center shadow-2xl relative`}
          animate={{
            boxShadow: theme.mode === 'cool' ? [
              "0 25px 50px -12px rgba(59, 130, 246, 0.2)",
              "0 25px 50px -12px rgba(6, 182, 212, 0.4)",
              "0 25px 50px -12px rgba(59, 130, 246, 0.2)",
            ] : [
              "0 25px 50px -12px rgba(251, 146, 60, 0.2)",
              "0 25px 50px -12px rgba(249, 115, 22, 0.4)",
              "0 25px 50px -12px rgba(251, 146, 60, 0.2)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Lock size={40} className="text-white" />
        </motion.div>
        <h1 className={`text-5xl font-black text-white tracking-tight bg-gradient-to-r ${textGradientClass} bg-clip-text text-transparent`}>
          Lockr
        </h1>
        <p className="text-white/60 text-lg">Your private digital time capsule.</p>
      </div>

      <GlassCard className="p-6 space-y-6" hoverable={false}>
        <div className="flex bg-white/5 p-1 rounded-2xl">
          <button 
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${!isSignUp ? 'bg-white text-gray-950' : 'text-white/40'}`}
          >
            Login
          </button>
          <button 
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${isSignUp ? 'bg-white text-gray-950' : 'text-white/40'}`}
          >
            Sign Up
          </button>
        </div>

        <div className="flex justify-center gap-4">
          <button 
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`text-xs font-bold uppercase tracking-widest transition-all ${authMethod === 'email' ? accentClass : 'text-white/20'}`}
          >
            Email
          </button>
          <button 
            type="button"
            onClick={() => setAuthMethod('phone')}
            className={`text-xs font-bold uppercase tracking-widest transition-all ${authMethod === 'phone' ? accentClass : 'text-white/20'}`}
          >
            Phone
          </button>
        </div>

        {isSignUp && (
          <div className="flex flex-col items-center gap-4 mb-2">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 bg-white/5 relative">
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <Loader2 className="text-white animate-spin" size={24} />
                  </div>
                )}
                <ImageWithFallback src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className={`absolute bottom-0 right-0 p-2 ${accentBgClass} text-white rounded-full shadow-lg ${accentBgHoverClass} transition-colors disabled:opacity-50`}
              >
                <Camera size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
              {uploadingAvatar ? 'Uploading...' : 'Tap to upload photo'}
            </p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-hidden ${accentBorderClass} transition-all`}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-bold">@</span>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    required
                    className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-white focus:outline-hidden ${accentBorderClass} transition-all`}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">
              {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <div className="relative">
              {authMethod === 'email' ? (
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              ) : (
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              )}
              <input 
                type={authMethod === 'email' ? 'email' : 'tel'} 
                value={authMethod === 'email' ? email : phone}
                onChange={(e) => authMethod === 'email' ? setEmail(e.target.value) : setPhone(e.target.value)}
                placeholder={authMethod === 'email' ? "your@email.com" : "+1 (555) 000-0000"}
                required
                className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-hidden ${accentBorderClass} transition-all`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-hidden ${accentBorderClass} transition-all`}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-white text-gray-950 rounded-3xl font-black text-xl shadow-2xl shadow-white/10 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" /> : isSignUp ? 'SIGN UP' : 'LOG IN'}
            {!loading && <ArrowRight size={24} />}
          </button>
        </form>
      </GlassCard>

      <div className="mt-8 text-center">
        <p className="text-white/40 text-xs font-medium">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-white font-bold hover:underline"
          >
            {isSignUp ? 'Login now' : 'Create one'}
          </button>
        </p>
      </div>
    </motion.div>
  );
};