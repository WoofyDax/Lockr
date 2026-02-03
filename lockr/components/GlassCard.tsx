import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const GlassCard = ({ children, className = '', hoverable = true }: GlassCardProps) => {
  return (
    <div className={`
      relative overflow-hidden
      bg-white/10 backdrop-blur-xl
      border border-white/20
      shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
      rounded-3xl
      transition-all duration-300
      ${hoverable ? 'hover:bg-white/15 hover:border-white/30 hover:scale-[1.01] hover:shadow-[0_12px_48px_0_rgba(139,92,246,0.3)] cursor-pointer active:scale-[0.99]' : ''}
      ${className}
    `}>
      {/* Animated Gradient Border Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl blur-xl" />
      
      {/* Liquid Sheen Highlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Animated Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
};