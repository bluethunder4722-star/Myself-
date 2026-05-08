/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { DesktopLayout } from './components/Layout';
import { Feed } from './pages/Feed';
import { Chat } from './pages/Chat';
import { AIAssistant } from './pages/AIAssistant';
import { Profile } from './pages/Profile';
import { Search } from './pages/Search';
import { motion, AnimatePresence } from 'motion/react';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-black to-black opacity-60" />
      
      {/* Animated Rings */}
      <motion.div 
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute w-[400px] h-[400px] rounded-full border border-primary/10 border-t-primary/50"
      />
      <motion.div 
        animate={{ 
          rotate: -360,
          scale: [1, 1.5, 1],
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute w-[300px] h-[300px] rounded-full border border-accent/10 border-b-accent/50 filter blur-[2px]"
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        className="relative z-10 flex flex-col items-center"
      >
        <span className="text-6xl md:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-accent tracking-widest drop-shadow-[0_0_30px_rgba(124,58,237,0.8)] neon-text">
          MYSELF
        </span>
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.8, ease: "circOut" }}
          className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mt-4"
        />
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-4 text-xs tracking-[0.3em] text-primary uppercase font-mono"
        >
          Connecting Dimensions
        </motion.p>
      </motion.div>

      {/* Loading Bar */}
      <div className="absolute bottom-16 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_15px_rgba(124,58,237,1)]"
        />
      </div>
    </motion.div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        ) : (
          <motion.div 
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="h-screen w-full"
          >
            <Router>
              <DesktopLayout>
                <Routes>
                  <Route path="/" element={<Feed />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/ai" element={<AIAssistant />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </DesktopLayout>
            </Router>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthProvider>
  );
}

