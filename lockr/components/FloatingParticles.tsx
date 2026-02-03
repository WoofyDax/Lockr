import { motion } from 'motion/react';
import { useTheme } from '../lib/theme';

export const FloatingParticles = () => {
  const { theme } = useTheme();
  const particles = Array.from({ length: 25 }); // Reduced from 40

  // Shooting stars / meteor effect
  const meteors = Array.from({ length: 5 }); // Reduced from 8
  
  const meteorColor = theme.mode === 'cool' 
    ? 'from-blue-400/60 via-cyan-400/40 to-transparent'
    : 'from-orange-400/60 via-rose-400/40 to-transparent';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Slower floating particles with less movement */}
      {particles.map((_, i) => {
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        const endX = startX + (Math.random() * 100 - 50); // Less movement range
        const endY = startY + (Math.random() * 100 - 50);
        const midX = (startX + endX) / 2 + (Math.random() * 50 - 25);
        const midY = (startY + endY) / 2 + (Math.random() * 50 - 25);
        
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x: startX,
              y: startY,
              scale: Math.random() * 0.8 + 0.4,
            }}
            animate={{
              x: [startX, midX, endX, startX],
              y: [startY, midY, endY, startY],
              opacity: [0.1, 0.6, 0.3, 0.1],
              scale: [0.4, 1, 0.6, 0.4],
            }}
            transition={{
              duration: Math.random() * 12 + 12, // Slower
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 8,
            }}
          />
        );
      })}
      
      {/* Shooting stars / meteors */}
      {meteors.map((_, i) => (
        <motion.div
          key={`meteor-${i}`}
          className={`absolute h-[2px] w-[120px] bg-linear-to-r ${meteorColor} rounded-full`}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -50,
            rotate: 45,
            opacity: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth - 300,
            y: window.innerHeight + 50,
            opacity: [0, 1, 0.7, 0],
          }}
          transition={{
            duration: Math.random() * 1.5 + 0.8,
            repeat: Infinity,
            ease: "easeIn",
            delay: Math.random() * 20 + 5, // Less frequent
            repeatDelay: Math.random() * 15 + 10
          }}
        />
      ))}
    </div>
  );
};