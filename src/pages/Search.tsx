import { useState } from 'react';
import { motion } from 'motion/react';
import { Search as SearchIcon, Mic, TrendingUp, Sparkles, Hash, Users, Clock } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

const TRENDING_SEARCHES = [
  "Neon Aesthetics",
  "Cyberpunk Edits",
  "AI Generated Music",
  "Next Gen UI",
  "Future Technology"
];

const SUGGESTED_CREATORS = [
  { id: 1, name: "Nexus Prime", tag: "@nexus", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" },
  { id: 2, name: "Aria Glow", tag: "@aria_g", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=100&auto=format&fit=crop" },
  { id: 3, name: "Zero Cool", tag: "@zero", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop" }
];

const RECENT_SEARCHES = [
  "How to use AI",
  "Best flutter animations",
  "Cyber city"
];

export function Search() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="h-full w-full flex flex-col p-4 md:p-8 overflow-y-auto no-scrollbar relative">
      <div className="max-w-4xl w-full mx-auto flex flex-col gap-8">
        
        {/* Cinematic Search Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-5xl font-display font-bold neon-text">Explore</h1>
          </div>

          <div className={`relative transition-all duration-500 ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
            <div className={`absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-2xl blur-xl transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
            <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl">
              <SearchIcon className="w-6 h-6 text-white/50 ml-3" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search MYSELF..."
                className="flex-1 bg-transparent border-none text-lg h-14 px-4 focus-visible:ring-0 text-white placeholder:text-white/30 font-medium"
              />
              {query && (
                 <Button variant="ghost" size="icon" onClick={() => setQuery('')} className="rounded-full text-white/50 hover:text-white">
                   <div className="w-5 h-5 flex items-center justify-center font-bold text-lg leading-none">&times;</div>
                 </Button>
              )}
              <div className="w-px h-8 bg-white/10 mx-2" />
              <Button size="icon" variant="ghost" className="rounded-xl text-primary hover:bg-primary/20 hover:text-primary">
                <Mic className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {query ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-8 pt-4"
          >
            <div className="bg-card/20 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 text-center text-white/50">
               <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary" />
               <p>AI is searching the multiverse for "{query}"...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-10"
          >
            {/* AI Suggestions & History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-xl">
                 <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2 text-white/90">
                   <Clock className="w-5 h-5 text-accent" /> Recent
                 </h3>
                 <div className="flex flex-col gap-3">
                   {RECENT_SEARCHES.map(item => (
                     <button key={item} className="flex items-center gap-3 text-left w-full hover:bg-white/5 p-2 rounded-xl transition-colors">
                       <SearchIcon className="w-4 h-4 text-white/30" />
                       <span className="text-white/70">{item}</span>
                     </button>
                   ))}
                 </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                 <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2 text-white/90 relative z-10">
                   <Sparkles className="w-5 h-5 text-primary" /> AI Suggested
                 </h3>
                 <div className="flex flex-wrap gap-2 relative z-10">
                   {TRENDING_SEARCHES.map(item => (
                     <span key={item} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-1.5 shadow-sm">
                       <Hash className="w-3 h-3 text-primary" />
                       {item}
                     </span>
                   ))}
                 </div>
              </div>
            </div>

            {/* Trending Creators */}
            <div>
               <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2 text-white">
                 <Users className="w-6 h-6 text-primary" /> Trending Mores
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {SUGGESTED_CREATORS.map(creator => (
                   <div key={creator.id} className="bg-card/20 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors group">
                      <Avatar className="w-14 h-14 ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
                        <AvatarImage src={creator.avatar} />
                        <AvatarFallback>{creator.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold text-white group-hover:text-primary transition-colors">{creator.name}</span>
                        <span className="text-sm font-mono text-white/50">{creator.tag}</span>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Trending Reels Grid */}
            <div>
               <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2 text-white">
                 <TrendingUp className="w-6 h-6 text-accent" /> Trending Reels
               </h3>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-[9/16] bg-zinc-900 rounded-3xl overflow-hidden relative group cursor-pointer border border-white/10 hover:border-primary/50 transition-colors shadow-lg">
                       <img src={`https://images.unsplash.com/photo-${1600000000000 + i + 10}?q=80&w=400&auto=format&fit=crop`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" alt="reel" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <div className="flex items-center gap-4 text-white text-sm font-semibold">
                             <span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary" /> {Math.floor(Math.random() * 500)}k</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
