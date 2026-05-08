import React from "react";
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Bot, User as UserIcon, LayoutDashboard, Settings, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { motion } from 'motion/react';

export function NavigationSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  
  const links = [
    { icon: Home, label: 'Feed', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: MessageCircle, label: 'Messages', href: '/chat' },
    { icon: Bot, label: 'Genesis AI', href: '/ai' },
    { icon: UserIcon, label: 'Profile', href: '/profile' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex h-full w-64 bg-card/40 backdrop-blur-2xl border-r border-white/5 flex-col py-8 px-4 flex-shrink-0 z-50 transition-all duration-300 relative shadow-[min(10vw,30px)_0_100px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-display font-bold neon-text tracking-wider">MYSELF</span>
        </div>

        <div className="flex-1 flex flex-col gap-4 w-full">
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="desktopNavIndicator"
                    className="absolute inset-0 bg-primary/10 rounded-2xl border border-primary/20 shadow-[inset_0_0_20px_rgba(124,58,237,0.1)]"
                  />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(124,58,237,0.8)]" />
                )}
                <Icon className={cn("w-6 h-6 relative z-10 transition-transform group-hover:scale-110", isActive && "drop-shadow-[0_0_8px_rgba(124,58,237,0.8)]")} />
                <span className="font-semibold relative z-10 text-[15px]">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="w-full mt-auto pt-6">
          {user ? (
            <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md">
               <Avatar className="w-10 h-10 border-2 border-black ring-2 ring-primary/40">
                 <AvatarImage src={user.photoURL || ''} />
                 <AvatarFallback className="bg-gradient-to-tr from-primary to-accent text-white">{user.displayName?.[0]}</AvatarFallback>
               </Avatar>
               <div className="flex flex-col overflow-hidden">
                 <span className="text-sm font-semibold truncate text-white">{user.displayName}</span>
                 <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Online</span>
                 </div>
               </div>
            </div>
          ) : (
            <Button 
              className="w-full h-12 rounded-2xl bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)] font-bold" 
              onClick={() => signInWithPopup(auth, googleProvider)}
            >
              Sign In
            </Button>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 h-16 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full z-50 px-6 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] supports-[backdrop-filter]:bg-black/60">
        {links.map((link) => {
            const isActive = location.pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "relative p-3 flex items-center justify-center transition-colors duration-300",
                  isActive ? "text-primary" : "text-white/50 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="mobileNavIndicator"
                    className="absolute inset-1.5 bg-primary/20 rounded-full blur-md"
                  />
                )}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3.5 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(124,58,237,1)]" />
                )}
                <Icon className={cn("w-6 h-6 relative z-10", isActive && "drop-shadow-[0_0_8px_rgba(124,58,237,0.8)]")} />
              </Link>
            );
        })}
      </nav>
    </>
  );
}

export function DesktopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-black overflow-hidden relative">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[50%] h-[30%] rounded-full bg-primary/20 blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-[40%] h-[40%] rounded-full bg-accent/20 blur-[150px] pointer-events-none mix-blend-screen" />
      
      <NavigationSidebar />
      <main className="flex-1 h-full relative overflow-hidden z-10 rounded-l-[3rem] bg-black/40 backdrop-blur-sm border-l border-white/5">
        {children}
      </main>
    </div>
  );
}
