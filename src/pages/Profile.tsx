import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { LogOut, User as UserIcon, Settings, ShieldCheck, Grid, Video, Bookmark, Users, Hash, Link2, Music2, Sparkles, MapPin, X, Palette, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AI_THEMES = [
  { 
    id: 'cyberpunk', 
    name: 'Cyberpunk', 
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', 
    color: 'from-blue-500 to-purple-500',
    textGradient: 'from-primary to-accent',
    ring: 'ring-primary/40',
    shadow: 'shadow-[0_0_50px_rgba(124,58,237,0.4)]',
    musicBg: 'bg-primary/20',
    musicText: 'text-primary',
    hoverText: 'group-hover:text-primary'
  },
  { 
    id: 'neon_tokyo', 
    name: 'Neon Tokyo', 
    cover: 'https://images.unsplash.com/photo-1542051812-f4709d438fb6?q=80&w=2000&auto=format&fit=crop', 
    color: 'from-pink-500 to-rose-500',
    textGradient: 'from-pink-500 to-rose-500',
    ring: 'ring-pink-500/40',
    shadow: 'shadow-[0_0_50px_rgba(236,72,153,0.4)]',
    musicBg: 'bg-pink-500/20',
    musicText: 'text-pink-500',
    hoverText: 'group-hover:text-pink-500'
  },
  { 
    id: 'matrix', 
    name: 'Matrix', 
    cover: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop', 
    color: 'from-emerald-500 to-green-500',
    textGradient: 'from-emerald-500 to-green-500',
    ring: 'ring-emerald-500/40',
    shadow: 'shadow-[0_0_50px_rgba(16,185,129,0.4)]',
    musicBg: 'bg-emerald-500/20',
    musicText: 'text-emerald-500',
    hoverText: 'group-hover:text-emerald-500'
  },
  { 
    id: 'synthwave', 
    name: 'Synthwave', 
    cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop', 
    color: 'from-fuchsia-500 to-cyan-500',
    textGradient: 'from-fuchsia-500 to-cyan-500',
    ring: 'ring-fuchsia-500/40',
    shadow: 'shadow-[0_0_50px_rgba(217,70,239,0.4)]',
    musicBg: 'bg-fuchsia-500/20',
    musicText: 'text-fuchsia-500',
    hoverText: 'group-hover:text-fuchsia-500'
  },
];

const AI_BIOS = [
  "Building the future of digital interaction. Exploring AI, cyberpunk aesthetics, and next-gen social platforms.",
  "Digital nomad traveling through the metaverse. Capturing neon dreams and synthwave realities.",
  "AI enthusiast & Tech innovator. Bridging the gap between human creativity and artificial intelligence.",
  "Creating art with algorithms. Welcome to my digital gallery of the future.",
];

function EditProfileModal({ user, onClose, currentData, onPreviewTheme }: { user: any, onClose: () => void, currentData: any, onPreviewTheme: (themeId: string | null) => void }) {
  const [bio, setBio] = useState(currentData?.bio || "");
  const [location, setLocation] = useState(currentData?.location || "Neo-Tokyo");
  const [website, setWebsite] = useState(currentData?.website || "");
  const [role, setRole] = useState(currentData?.role || "Level 42 Creator");
  const [activeTheme, setActiveTheme] = useState(currentData?.themeId || 'cyberpunk');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    onPreviewTheme(activeTheme);
  }, [activeTheme, onPreviewTheme]);

  const handleClose = () => {
    onPreviewTheme(null);
    onClose();
  };

  const handleGenerateBio = () => {
    setIsGeneratingBio(true);
    setTimeout(() => {
      const randomBio = AI_BIOS[Math.floor(Math.random() * AI_BIOS.length)];
      setBio(randomBio);
      setIsGeneratingBio(false);
    }, 1000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const selectedTheme = AI_THEMES.find(t => t.id === activeTheme);
      await updateDoc(doc(db, 'users', user.uid), {
        bio,
        location,
        website,
        role,
        themeId: activeTheme,
        coverImage: selectedTheme?.cover || AI_THEMES[0].cover
      });
      setIsSaving(false);
      onPreviewTheme(null);
      onClose();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'users');
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-zinc-900 border border-white/10 w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
          <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Profile Settings
          </h2>
          <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto no-scrollbar flex flex-col gap-8">
          
          {/* AI Banner Theme Selection */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Palette className="w-4 h-4 text-accent" /> AI Profile Themes
              </label>
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">Auto-Generated</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {AI_THEMES.map(theme => (
                <div 
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id)}
                  className={`relative h-24 rounded-xl cursor-pointer overflow-hidden border-2 transition-all ${activeTheme === theme.id ? 'border-primary shadow-[0_0_15px_rgba(124,58,237,0.5)]' : 'border-transparent'}`}
                >
                  <img src={theme.cover} alt={theme.name} className="w-full h-full object-cover opacity-60" />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${theme.color} opacity-40 mix-blend-overlay`} />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-xs font-semibold text-white">{theme.name}</span>
                  </div>
                  {activeTheme === theme.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-black">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Bio Generator */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white/80">About ME</label>
            </div>
            <textarea
               value={bio}
               onChange={(e) => setBio(e.target.value)}
               placeholder="Write your bio..."
               className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:ring-1 focus:ring-primary focus:outline-none resize-none h-28"
            />
            <Button 
              onClick={handleGenerateBio} 
              disabled={isGeneratingBio}
              variant="outline" 
              className="w-full border-primary/30 text-primary hover:bg-primary/10 rounded-xl h-12"
            >
               {isGeneratingBio ? (
                 <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" /> Generating...</span>
               ) : (
                 <span className="flex items-center gap-2"><Wand2 className="w-4 h-4" /> Suggest Bio with AI</span>
               )}
            </Button>
          </div>

          {/* Additional Profile Info */}
          <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between">
               <label className="text-sm font-semibold text-white/80">Title / Role</label>
             </div>
             <input
               value={role}
               onChange={(e) => setRole(e.target.value)}
               placeholder="e.g. Prompt Engineer"
               className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:ring-1 focus:ring-primary focus:outline-none"
             />
             <div className="flex items-center justify-between mt-2">
               <label className="text-sm font-semibold text-white/80">Location</label>
             </div>
             <input
               value={location}
               onChange={(e) => setLocation(e.target.value)}
               placeholder="e.g. San Francisco, CA"
               className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:ring-1 focus:ring-primary focus:outline-none"
             />
             <div className="flex items-center justify-between mt-2">
               <label className="text-sm font-semibold text-white/80">Website</label>
             </div>
             <input
               value={website}
               onChange={(e) => setWebsite(e.target.value)}
               placeholder="e.g. https://myself.app/..."
               className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:ring-1 focus:ring-primary focus:outline-none"
             />
          </div>

        </div>

        <div className="p-6 border-t border-white/5 bg-black/20 mt-auto">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Mock Data
const HIGHLIGHTS = [
  { id: 1, title: 'Adventures \u2728', image: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=200&auto=format&fit=crop' },
  { id: 2, title: 'Studio', image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200&auto=format&fit=crop' },
  { id: 3, title: 'Life', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop' },
  { id: 4, title: 'Vibes', image: 'https://plus.unsplash.com/premium_photo-1669865660505-1a221f7ed4e7?q=80&w=200&auto=format&fit=crop' },
];

const TABS = [
  { id: 'reels', label: 'Reels', icon: Video },
  { id: 'posts', label: 'Posts', icon: Grid },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'tagged', label: 'Tagged', icon: Hash },
  { id: 'friends', label: 'Friends', icon: Users },
];

export function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('reels');
  const [showEditModal, setShowEditModal] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });
    return unsub;
  }, [user]);

  const activeThemeId = previewThemeId || userData?.themeId || 'cyberpunk';
  const theme = AI_THEMES.find(t => t.id === activeThemeId) || AI_THEMES[0];

  if (!user) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="z-10 flex flex-col items-center max-w-md text-center bg-card/10 backdrop-blur-3xl border border-white/10 p-12 rounded-[3xl] shadow-2xl">
          <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
            <UserIcon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-4 neon-text">Unlock MYSELF</h1>
          <p className="text-muted-foreground mb-8 text-lg">Sign in to access your feed, messaging, and AI genesis assistant.</p>
          <Button 
            size="lg" 
            className="w-full h-14 text-lg rounded-2xl bg-white text-black hover:bg-gray-200 transition-all font-semibold"
            onClick={() => signInWithPopup(auth, googleProvider)}
          >
            Continue with Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(20px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-full w-full flex flex-col overflow-y-auto no-scrollbar relative bg-black text-white"
    >
      {/* Dynamic Cover Banner */}
      <div className="h-72 md:h-96 w-full relative overflow-hidden group">
        <motion.img 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={previewThemeId ? theme.cover : (userData?.coverImage || theme.cover)}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          alt="cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {/* Cover Actions */}
        <div className="absolute top-6 right-6 flex gap-4">
           <Button variant="ghost" size="icon" className="rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/10 text-white">
              <Sparkles className="w-5 h-5" />
           </Button>
           <Button variant="ghost" size="icon" onClick={() => setShowEditModal(true)} className="rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/10 text-white">
              <Settings className="w-5 h-5" />
           </Button>
        </div>

        {/* Music Player Mock */}
        <div className="absolute bottom-16 right-6 md:right-12 flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 p-2 pr-4 rounded-full">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden ${theme.musicBg}`}>
             <Music2 className={`w-5 h-5 z-10 ${theme.musicText}`} />
             <div className={`absolute inset-0 animate-pulse ${theme.musicBg}`} />
           </div>
           <div className="flex flex-col">
             <span className="text-xs font-semibold text-white">Cyberpunk City</span>
             <span className="text-[10px] text-white/60">AI Generated</span>
           </div>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto px-4 md:px-8 relative z-10 -mt-24 mb-16">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 text-center md:text-left">
          
          <motion.div 
             initial={{ y: 50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="relative group"
          >
            <Avatar className={`w-40 h-40 border-[6px] border-black ring-4 ${theme.ring} ${theme.shadow} transition-transform duration-500 group-hover:scale-105`}>
              <AvatarImage src={user.photoURL || ''} className="object-cover" />
              <AvatarFallback className={`text-5xl bg-gradient-to-tr ${theme.textGradient} text-white font-bold`}>{user.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-black animate-pulse" />
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 mb-2"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-4xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">{user.displayName}</h1>
              <ShieldCheck className={`w-7 h-7 drop-shadow-md hidden md:block ${theme.musicText}`} />
            </div>
            <p className={`font-mono text-sm mb-3 ${theme.musicText}`}>@{(user.displayName || 'user').toLowerCase().replace(/\s/g, '')} • <span className="text-white/60 font-sans">{userData?.role || 'Level 42 Creator'}</span></p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-white/50" /> {userData?.location || 'Neo-Tokyo'}</span>
              {(userData?.website || true) && (
                <span className="flex items-center gap-1"><Link2 className="w-4 h-4 text-white/50" /> {userData?.website || `myself.app/${(user.displayName || 'user').split(' ')[0].toLowerCase()}`}</span>
              )}
            </div>
          </motion.div>

          <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.5, delay: 0.4 }}
             className="flex gap-4 w-full md:w-auto"
          >
            <Button className="flex-1 md:flex-none rounded-2xl h-14 px-8 bg-white text-black hover:bg-white/90 font-bold text-base shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Follow
            </Button>
            <Button variant="outline" className="flex-1 md:flex-none rounded-2xl h-14 px-8 border-white/20 bg-white/5 hover:bg-white/10 font-bold text-base backdrop-blur-md">
              Message
            </Button>
          </motion.div>
        </div>

        {/* Bio & Stats */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-zinc-900/50 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 mb-10 shadow-2xl"
        >
           <p className="text-lg leading-relaxed text-white/90 font-light mb-8 max-w-3xl text-center md:text-left mx-auto md:mx-0 whitespace-pre-line">
             {userData?.bio || "Building the future of digital interaction. Exploring AI, cyberpunk aesthetics, and next-gen social platforms. Let's create something beautiful together. \u2728"}
           </p>

           <div className="flex justify-around md:justify-start md:gap-16 border-t border-white/5 pt-8">
             <div className="flex flex-col items-center md:items-start group cursor-pointer">
               <span className={`text-3xl font-display font-bold text-white transition-colors ${theme.hoverText}`}>
                 {Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(userData?.postsCount || 0)}
               </span>
               <span className="text-xs font-semibold tracking-widest text-white/50 uppercase mt-1">Posts</span>
             </div>
             <div className="flex flex-col items-center md:items-start group cursor-pointer">
               <span className={`text-3xl font-display font-bold text-white transition-colors ${theme.hoverText}`}>
                 {Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(userData?.followersCount || 0)}
               </span>
               <span className="text-xs font-semibold tracking-widest text-white/50 uppercase mt-1">Followers</span>
             </div>
             <div className="flex flex-col items-center md:items-start group cursor-pointer">
               <span className={`text-3xl font-display font-bold text-white transition-colors ${theme.hoverText}`}>
                 {Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(userData?.followingCount || 0)}
               </span>
               <span className="text-xs font-semibold tracking-widest text-white/50 uppercase mt-1">Following</span>
             </div>
           </div>
        </motion.div>

        {/* Story Highlights */}
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 1, delay: 0.6 }}
           className="flex gap-4 overflow-x-auto no-scrollbar pb-6 mb-8 snap-x"
        >
          {HIGHLIGHTS.map((h, i) => (
             <div key={h.id} className="snap-start flex flex-col items-center gap-3 cursor-pointer group shrink-0">
               <div className={`w-20 h-20 p-1 rounded-full bg-gradient-to-tr ${theme.color} scale-100 group-hover:scale-105 transition-transform duration-300 ${theme.shadow}`}>
                  <div className="w-full h-full rounded-full border-4 border-black overflow-hidden relative">
                     <img src={h.image} className="w-full h-full object-cover" alt={h.title} />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
               </div>
               <span className="text-xs font-medium text-white/80">{h.title}</span>
             </div>
          ))}
          <div className="snap-start flex flex-col items-center gap-3 cursor-pointer group shrink-0">
               <div className="w-20 h-20 p-1 rounded-full border-2 border-dashed border-white/30 scale-100 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-md">
                  <span className="text-2xl text-white/50 group-hover:text-white">+</span>
               </div>
               <span className="text-xs font-medium text-white/50">New</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10 flex overflow-x-auto no-scrollbar py-2 mb-8">
           {TABS.map(tab => {
             const Icon = tab.icon;
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`relative flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-colors whitespace-nowrap ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
               >
                 <Icon className="w-5 h-5" />
                 {tab.label}
                 {isActive && (
                   <motion.div 
                     layoutId="profileTabIndicator"
                     className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.textGradient} rounded-t-full shadow-lg`} 
                   />
                 )}
               </button>
             );
           })}
        </div>

        {/* Tab Content Placeholder */}
        <motion.div 
           key={activeTab}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4 }}
           className="min-h-[400px]"
        >
          {activeTab === 'reels' && (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden relative group cursor-pointer border border-white/5 hover:border-primary/30 transition-colors">
                     <img src={`https://images.unsplash.com/photo-${1600000000000 + i}?q=80&w=400&auto=format&fit=crop`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt="reel" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div className="flex items-center gap-4 text-white text-sm font-semibold">
                           <span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary" /> {Math.floor(Math.random() * 500)}k</span>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          )}
          {activeTab !== 'reels' && (
             <div className="flex flex-col items-center justify-center py-20 text-white/50">
                <Grid className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg">No content in {TABS.find(t => t.id === activeTab)?.label} yet.</p>
             </div>
          )}
        </motion.div>
        
        <div className="py-12 flex justify-center">
             <Button onClick={() => signOut(auth)} variant="destructive" className="rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 px-8 h-12">
               <LogOut className="w-5 h-5 mr-2" />
               Sign Out
             </Button>
        </div>

      </div>
      <AnimatePresence>
        {showEditModal && <EditProfileModal user={user} currentData={userData} onClose={() => setShowEditModal(false)} onPreviewTheme={setPreviewThemeId} />}
      </AnimatePresence>
    </motion.div>
  );
}
