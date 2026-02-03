import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../lib/theme';

export const LiquidBackground = () => {
  const { theme } = useTheme();
  
  // Generate random stars
  const stars = Array.from({ length: 150 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 3 + 2, // Slower twinkling
    delay: Math.random() * 2,
    opacity: Math.random() * 0.7 + 0.3,
    // Reduced movement
    moveX: Math.random() * 5 - 2.5,
    moveY: Math.random() * 5 - 2.5,
    moveDuration: Math.random() * 20 + 15
  }));

  // Dynamic color classes based on theme
  const accentGlow1 = theme.mode === 'cool' 
    ? 'bg-blue-500/10'
    : 'bg-orange-500/10';
    
  const accentGlow2 = theme.mode === 'cool'
    ? 'bg-cyan-500/10'
    : 'bg-rose-500/10';
    
  const accentGlow3 = theme.mode === 'cool'
    ? 'bg-sky-500/10'
    : 'bg-amber-500/10';
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {/* Deep space gradient base */}
      <div className="absolute inset-0 bg-linear-to-br from-black via-gray-950 to-black opacity-90" />
      
      {/* Animated starfield */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{
              opacity: [star.opacity, star.opacity * 0.2, star.opacity],
              scale: [1, 1.4, 1],
              x: [0, star.moveX, -star.moveX, 0],
              y: [0, star.moveY, -star.moveY, 0],
            }}
            transition={{
              opacity: {
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
                ease: "easeInOut"
              },
              scale: {
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
                ease: "easeInOut"
              },
              x: {
                duration: star.moveDuration,
                repeat: Infinity,
                ease: "easeInOut"
              },
              y: {
                duration: star.moveDuration,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
        ))}
      </div>

      {/* Subtle colored nebula glows for theme accent */}
      <motion.div
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -30, 50, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className={`absolute top-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full ${accentGlow1} blur-[120px]`}
      />
      
      <motion.div
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 50, -20, 0],
          scale: [1, 1.2, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className={`absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full ${accentGlow2} blur-[140px]`}
      />

      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, 40, 10, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className={`absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full ${accentGlow3} blur-[100px]`}
      />

      {/* Glass Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};