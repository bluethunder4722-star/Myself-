import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { Heart, MessageCircle, Share2, MoreHorizontal, Video as VideoIcon, Sparkles, Upload, X, Music, Hash, Eye, Globe, Send, BadgeCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '../components/ui/input';

const REEL_VIDEOS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop"
];

function ReelPost({ post, isActive, currentUser }: { post: any, isActive: boolean, currentUser: any, key?: React.Key }) {
  const [liked, setLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleDoubleTap = async () => {
    if (!liked) {
        await handleLike();
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  const handleLike = async () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    if (!currentUser) return;
    try {
        const postRef = doc(db, 'posts', post.id);
        await updateDoc(postRef, {
            likesCount: increment(newLikedState ? 1 : -1)
        });
    } catch (e) {
      console.error(e);
      setLiked(!newLikedState); // revert
    }
  };

  return (
    <div className="w-full h-full snap-start snap-always relative flex items-center justify-center bg-black overflow-hidden group">
      {/* Background Media */}
      {post.mediaType === 'image' ? (
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: isActive ? 1 : 1.1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={post.mediaUrl} 
          className="absolute inset-0 w-full h-full object-cover opacity-80" 
          alt="post" 
        />
      ) : (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-zinc-900">
          <VideoIcon className="w-20 h-20 text-white/20" />
        </div>
      )}
      
      {/* Double Tap Heart Animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -15 }}
            animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="absolute z-20 text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]"
          >
            <Heart className="w-32 h-32 fill-current" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-transparent to-black/40 pointer-events-none" />

      {/* Interactive Layer */}
      <div className="absolute inset-0 z-10" onDoubleClick={handleDoubleTap}></div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 right-16 p-6 z-20 text-white flex flex-col gap-4">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={isActive ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <Avatar className="w-12 h-12 ring-2 ring-primary/50 shadow-[0_0_15px_rgba(124,58,237,0.5)] cursor-pointer">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/20 text-primary">{(post.authorId || "U").substring(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold font-display tracking-wide drop-shadow-md text-lg flex items-center gap-1">
              @{post.authorId.substring(0, 8)}
              <BadgeCheck className="w-4 h-4 text-blue-400" />
            </span>
            <span className="text-xs text-white/70">
              {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
            </span>
          </div>
          <Button variant="outline" className="ml-2 bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-full h-8 text-xs backdrop-blur-md">
            Follow
          </Button>
        </motion.div>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={isActive ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm md:text-base leading-relaxed text-white/90 drop-shadow-md pr-4"
        >
          {post.caption}
        </motion.p>
        <motion.div
           initial={{ opacity: 0 }}
           animate={isActive ? { opacity: 1 } : { opacity: 0 }}
           transition={{ delay: 0.4 }}
           className="flex items-center gap-2 text-xs font-mono text-primary bg-black/40 backdrop-blur-md w-fit px-3 py-1.5 rounded-full border border-primary/20"
        >
           <Sparkles className="w-3 h-3" />
           <span>AI Enhanced</span>
        </motion.div>
      </div>

      {/* Right Sidebar Actions */}
      <div className="absolute right-4 bottom-12 z-20 flex flex-col gap-6 items-center">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleLike()}
          className="flex flex-col items-center gap-1 text-white drop-shadow-2xl"
        >
          <div className={`p-3 rounded-full backdrop-blur-xl transition-all ${liked ? 'bg-red-500/20 text-red-500' : 'bg-black/40 hover:bg-black/60'}`}>
            <Heart className={`w-7 h-7 ${liked ? 'fill-current' : ''}`} />
          </div>
          <span className="text-xs font-semibold">{post.likesCount || 0}</span>
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1 text-white drop-shadow-2xl"
        >
          <div className="p-3 bg-black/40 hover:bg-black/60 backdrop-blur-xl rounded-full transition-all">
            <MessageCircle className="w-7 h-7" />
          </div>
          <span className="text-xs font-semibold">{post.commentsCount}</span>
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowShare(true)}
          className="flex flex-col items-center gap-1 text-white drop-shadow-2xl"
        >
          <div className="p-3 bg-black/40 hover:bg-black/60 backdrop-blur-xl rounded-full transition-all">
            <Share2 className="w-7 h-7" />
          </div>
          <span className="text-xs font-semibold">Share</span>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1 text-white drop-shadow-2xl mt-4"
        >
          <div className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-xl rounded-full transition-all">
            <MoreHorizontal className="w-5 h-5" />
          </div>
        </motion.button>
      </div>

      <AnimatePresence>
        {showComments && <CommentsModal post={post} onClose={() => setShowComments(false)} currentUser={currentUser} />}
        {showShare && <ShareModal post={post} onClose={() => setShowShare(false)} />}
      </AnimatePresence>
    </div>
  );
}

function CommentsModal({ post, onClose, currentUser }: { post: any, onClose: () => void, currentUser: any }) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const q = query(collection(db, 'posts', post.id, 'comments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [post.id]);

  const handleSend = async () => {
    if (!text.trim() || !currentUser) return;
    try {
      const parentPostRef = doc(db, 'posts', post.id); 
      // Do them both
      await addDoc(collection(db, 'posts', post.id, 'comments'), {
        text,
        authorId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      await updateDoc(parentPostRef, {
        commentsCount: increment(1)
      });
      setText("");
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'comments');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4"
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-zinc-900 border-t sm:border border-white/10 w-full sm:max-w-md h-[70vh] sm:h-[600px] sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-semibold text-white">Comments ({post.commentsCount || comments.length})</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white/50 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">{(c.authorId || "U").substring(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white/80">@{c.authorId.substring(0, 8)} <span className="text-white/40 ml-1 font-normal">{c.createdAt ? formatDistanceToNow(c.createdAt.toDate(), { addSuffix: true }) : ''}</span></span>
                <p className="text-sm text-white/90">{c.text}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-white/40">
              <p>No comments yet. Be the first!</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-black/20 flex gap-2 items-center">
          <Avatar className="w-8 h-8 flex-shrink-0 hidden sm:block">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">{(currentUser?.uid || "U").substring(0, 1)}</AvatarFallback>
          </Avatar>
          <Input 
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Add a comment..."
            className="flex-1 bg-white/5 border-white/10 rounded-full text-white placeholder:text-white/30 h-10"
          />
          <Button disabled={!text.trim()} onClick={handleSend} variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/20 hover:text-primary">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ShareModal({ post, onClose }: { post: any, onClose: () => void }) {
  const shareOptions = [
    { icon: <MessageCircle className="w-6 h-6" />, label: "Chat", color: "bg-blue-500/20 text-blue-500" },
    { icon: <Globe className="w-6 h-6" />, label: "Copy Link", color: "bg-white/10 text-white" },
    { icon: <Heart className="w-6 h-6" />, label: "Story", color: "bg-red-500/20 text-red-500" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-zinc-900 border-t sm:border border-white/10 w-full sm:max-w-xs p-6 sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Share</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white/50 hover:text-white hover:bg-white/10 h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {shareOptions.map((opt, i) => (
            <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${opt.color}`}>
                {opt.icon}
              </div>
              <span className="text-xs font-medium text-white/70">{opt.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function UploadModal({ onClose, user }: { onClose: () => void, user: any }) {
  const [step, setStep] = useState(1);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image' | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      if (isVideo) {
        const supportedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        if (!supportedTypes.includes(file.type)) {
          setError("Unsupported video format. Please upload MP4, WebM, or MOV.");
          return;
        }
        if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB
          setError("Video file size exceeds 2GB limit.");
          return;
        }
      }

      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setMediaType(isVideo ? 'video' : 'image');
      setIsCompressing(true);
      
      // Simulate compression and metadata extraction
      setTimeout(() => {
        // Simulate a chance of compression error for larger videos (if we were actually processing)
        if (file.size > 50 * 1024 * 1024 && Math.random() > 0.7) {
          setError("Error during video compression. Please try a smaller file or different format.");
          setIsCompressing(false);
          setMediaFile(null);
          if (url) URL.revokeObjectURL(url);
          setMediaUrl(null);
          setMediaType(null);
          return;
        }

        setIsCompressing(false);
        setStep(2);
      }, 1500);
    }
  };

  const handleUpload = async () => {
    setError(null);
    setIsUploading(true);
    // Simulate upload delay (we'd use Firebase Storage here for real uploads)
    setTimeout(async () => {
      try {
        if (Math.random() > 0.9) {
          throw new Error("Simulated network upload error. Please try again.");
        }
        const finalUrl = mediaUrl || REEL_VIDEOS[Math.floor(Math.random() * REEL_VIDEOS.length)];
        const finalType = mediaType || 'image';
        await addDoc(collection(db, 'posts'), {
          authorId: user.uid,
          mediaUrl: finalUrl,
          mediaType: finalType,
          caption: caption || "Entering a new dimension ✨ #myself #future",
          likesCount: 0,
          commentsCount: 0,
          createdAt: serverTimestamp()
        });
        setIsUploading(false);
        onClose();
      } catch (e: any) {
        if (e.message.includes('Simulated')) {
            setError(e.message);
        } else {
            handleFirestoreError(e, OperationType.CREATE, 'posts');
            setError("Failed to create post. Please try again.");
        }
        setIsUploading(false);
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

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
        className="bg-zinc-900 border border-white/10 w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative"
      >
        <div className="absolute top-0 w-full h-1 bg-white/5">
           <motion.div 
             className="h-full bg-gradient-to-r from-primary to-accent" 
             initial={{ width: "50%" }} 
             animate={{ width: step === 1 ? "50%" : "100%" }} 
           />
        </div>

        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-display font-semibold text-white">
            {step === 1 ? "Select Media" : "Post Details"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-center text-sm font-medium">
              {error}
            </div>
          )}
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/20 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative"
                onClick={() => !isCompressing && fileInputRef.current?.click()}
              >
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleFileSelect} 
                   accept="video/*,image/*" 
                   className="hidden" 
                 />
                 {isCompressing ? (
                   <div className="flex flex-col items-center">
                     <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                     <h3 className="text-lg font-semibold text-white mb-2">Processing Media...</h3>
                     <p className="text-white/50 text-center text-sm">Compressing and extracting metadata.</p>
                   </div>
                 ) : (
                   <>
                     <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                       <Upload className="w-8 h-8 text-primary" />
                     </div>
                     <h3 className="text-lg font-semibold text-white mb-2">Upload or Drag Media</h3>
                     <p className="text-white/50 text-center text-sm">Supports HD Video up to 4K.<br/>Limit 10 minutes or 2GB.</p>
                   </>
                 )}
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col gap-4">
                  {mediaType === 'video' ? (
                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative shadow-inner">
                      <video src={mediaUrl!} className="w-full h-full object-contain" controls playsInline />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-black rounded-xl overflow-hidden relative shadow-inner flex items-center justify-center">
                      <img src={mediaUrl || REEL_VIDEOS[0]} className="w-full h-full object-cover opacity-80" alt="preview" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col gap-3">
                    <textarea 
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      placeholder="Write a caption... or ask AI ✨"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-1 focus:ring-primary focus:outline-none resize-none h-24 placeholder:text-white/30"
                    />
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="rounded-full h-8 text-xs bg-white/5 border border-white/10 text-white/80">
                        <Hash className="w-3 h-3 mr-1" /> Hashtags
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full h-8 text-xs border border-primary/30 text-primary hover:bg-primary/10 shadow-[0_0_10px_rgba(124,58,237,0.2)]">
                        <Sparkles className="w-3 h-3 mr-1" /> AI Caption
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                     <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                       <div className="flex items-center gap-3">
                         <Music className="w-5 h-5 text-white/50" />
                         <span className="text-sm text-white/80">Add Music</span>
                       </div>
                       <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">Trending &gt;</span>
                     </div>
                   <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                     <div className="flex items-center gap-3">
                       <Globe className="w-5 h-5 text-white/50" />
                       <span className="text-sm text-white/80">Visibility</span>
                     </div>
                     <span className="text-xs text-white/50">Public</span>
                   </div>
                </div>

                <div className="mt-4">
                  <Button 
                    onClick={handleUpload} 
                    disabled={isUploading}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                  >
                    {isUploading ? "Processing & Uploading..." : "Publish Reel"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Feed() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'posts'), 
      orderBy('createdAt', 'desc'), 
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, authLoading]);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollY = containerRef.current.scrollTop;
      const height = containerRef.current.clientHeight;
      const index = Math.round(scrollY / height);
      setActiveIndex(index);
    }
  };

  if (!user && !authLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-background">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
         <div className="z-10 flex flex-col items-center text-center max-w-md bg-card/20 backdrop-blur-2xl border border-white/5 p-12 rounded-[3rem] shadow-2xl">
            <h2 className="text-3xl font-display font-bold mb-4 neon-text">Explore MYSELF</h2>
            <p className="text-muted-foreground text-lg mb-8">Sign in to experience the ultimate cinematic reels feed.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative bg-black">
      {/* Top Navigation Overlay */}
      <div className="absolute top-0 left-0 w-full z-30 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <h1 className="text-2xl font-display font-bold text-white drop-shadow-xl pointer-events-auto">Reels</h1>
        <Button onClick={() => setShowUpload(true)} disabled={!user} className="rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-lg text-white pointer-events-auto border border-white/20">
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
           <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
           <VideoIcon className="w-16 h-16 mb-4 opacity-20" />
           <p>No reels yet. Be the first!</p>
        </div>
      ) : (
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar"
        >
          {posts.map((post, i) => (
            <ReelPost key={post.id} post={post} isActive={i === activeIndex} currentUser={user} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showUpload && <UploadModal user={user} onClose={() => setShowUpload(false)} />}
      </AnimatePresence>
    </div>
  );
}
