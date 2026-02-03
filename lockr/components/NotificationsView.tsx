import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ArrowLeft, Check, Trash2, Info, Sparkles, Clock, X } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { fetchWithAuth, supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { LiquidLoader } from './LiquidLoader';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type?: 'info' | 'success' | 'alert' | 'friend';
}

interface NotificationsViewProps {
  onBack: () => void;
}

export const NotificationsView = ({ onBack }: NotificationsViewProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      
      const response = await fetchWithAuth('/notifications');
      if (response.notifications) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetchWithAuth('/notifications/read', { method: 'POST', body: JSON.stringify({}) });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'success': return <Sparkles className="text-emerald-400" size={18} />;
      case 'alert': return <Clock className="text-amber-400" size={18} />;
      case 'friend': return <Bell className="text-violet-400" size={18} />;
      default: return <Info className="text-blue-400" size={18} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex-1 flex flex-col"
    >
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onBack} 
            className="p-2 bg-white/5 rounded-full text-white/60"
          >
            <ArrowLeft size={24} />
          </motion.button>
          <h2 className="text-2xl font-bold text-white">Inbox</h2>
        </div>
        {notifications.some(n => !n.read) && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={markAllAsRead}
            className="text-[10px] font-black uppercase tracking-widest text-violet-400 bg-violet-400/10 px-3 py-1.5 rounded-full border border-violet-400/20"
          >
            Read All
          </motion.button>
        )}
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <LiquidLoader />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-40">
          <div className="p-6 bg-white/5 rounded-full">
            <Bell size={48} />
          </div>
          <p className="font-bold">All caught up!</p>
          <p className="text-xs text-center max-w-[200px]">We'll let you know when moments unlock or friends reach out.</p>
        </div>
      ) : (
        <div className="space-y-4 pb-20">
          <AnimatePresence mode="popLayout">
            {notifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className={`p-4 relative overflow-hidden ${!notif.read ? 'bg-white/10' : 'bg-white/5 opacity-70'}`}>
                  {!notif.read && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-violet-500 to-fuchsia-500" />
                  )}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-bold text-white mb-0.5 ${!notif.read ? 'opacity-100' : 'opacity-60'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-white/20 font-medium block mt-2">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {!notif.read && (
                       <div className="w-2 h-2 bg-fuchsia-500 rounded-full mt-2" />
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
