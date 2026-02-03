import React from 'react';
import { LiquidBackground } from './components/LiquidBackground';
import { FloatingParticles } from './components/FloatingParticles';
import { LockrMain } from './components/LockrMain';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from 'sonner@2.0.3';

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen relative font-sans text-white selection:bg-fuchsia-500/30">
        <Toaster position="top-center" richColors />
        {/* Liquid Background Layer */}
        <LiquidBackground />
        
        {/* Floating Particles */}
        <FloatingParticles />
        
        {/* Navigation & Main Content */}
        <main className="relative z-10">
          <LockrMain />
        </main>

        {/* Mobile Safe Area Padding */}
        <div className="h-safe-bottom" />
      </div>
    </ThemeProvider>
  );
}