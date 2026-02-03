import React from 'react';
import { MessageCircle, Camera, Users, User } from 'lucide-react';
import { motion } from 'motion/react';

interface NavItem {
  id: string;
  icon: any;
  label: string;
  hasNotification?: boolean;
}

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
  hasUnreadChats?: boolean;
  hasUnreadNotifications?: boolean;
}

export const BottomNav = ({ activeView, onNavigate, hasUnreadChats, hasUnreadNotifications }: BottomNavProps) => {
  const navItems: NavItem[] = [
    { id: 'HOME', icon: MessageCircle, label: 'Capsules', hasNotification: hasUnreadChats },
    { id: 'CAMERA', icon: Camera, label: 'Camera' },
    { id: 'FRIENDS', icon: Users, label: 'Friends', hasNotification: hasUnreadNotifications },
    { id: 'SETTINGS', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="bg-gray-950/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative flex flex-col items-center gap-1.5 flex-1 min-w-0"
                whileTap={{ scale: 0.9 }}
              >
                <div className="relative flex items-center justify-center">
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute w-10 h-10 bg-blue-500/20 blur-xl rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative z-10 flex flex-col items-center">
                    <Icon 
                      size={20} 
                      className={isActive ? "text-blue-400" : "text-white/40"} 
                      fill={isActive ? "currentColor" : "none"} 
                    />
                  </div>
                  {item.hasNotification && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-gray-950"
                    />
                  )}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'text-white' : 'text-white/30'}`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};