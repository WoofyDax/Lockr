import React from 'react';
import { motion } from 'motion/react';

export const LiquidLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-24 h-24">
        {/* Outer spinning ring */}
        <motion.div
          className="absolute inset-0 border-4 border-transparent border-t-violet-500 border-l-fuchsia-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner liquid-like blobs */}
        <motion.div
          className="absolute inset-4 bg-linear-to-br from-violet-500 to-fuchsia-500 rounded-full blur-md opacity-50"
          animate={{
            scale: [1, 1.2, 1],
            borderRadius: ["50%", "40% 60% 70% 30% / 40% 50% 60% 50%", "50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Central pulsing core */}
        <motion.div
          className="absolute inset-8 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 flex items-center justify-center"
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>
      </div>
      
      <motion.p
        className="text-white/60 text-xs font-black uppercase tracking-[0.2em]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Decrypting...
      </motion.p>
    </div>
  );
};
