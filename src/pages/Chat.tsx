import React from "react";
import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';
import { Send, Phone, Video, Search, MoreVertical, MessageCircle, X, Sparkles, Settings, BellOff, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { motion, AnimatePresence } from 'motion/react';

function ChatSettingsModal({ chat, onClose, onLeave }: { chat: any, onClose: () => void, onLeave: () => void }) {
  const [muted, setMuted] = useState(false);

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
        className="bg-zinc-900 border border-white/10 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
          <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> Chat Settings
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <Button 
            variant="outline" 
            onClick={() => setMuted(!muted)}
            className={`w-full justify-start h-14 rounded-xl border-white/10 ${muted ? 'bg-primary/20 text-primary border-primary/30' : 'bg-black/40 text-white hover:bg-white/5'}`}
          >
            <BellOff className="w-5 h-5 mr-3" />
            {muted ? 'Unmute Notifications' : 'Mute Notifications'}
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={onLeave}
            className="w-full justify-start h-14 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Leave Chat
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Chat() {
  const { user, loading: authLoading } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load Chats
  useEffect(() => {
    if (authLoading || !user) return;
    const q = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chats'));
    return () => unsub();
  }, [user]);

  // Load Messages for Active Chat
  useEffect(() => {
    if (!user || !activeChat) return;
    const q = query(
      collection(db, `chats/${activeChat.id}/messages`),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `chats/${activeChat.id}/messages`));
    return () => unsub();
  }, [user, activeChat]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user || !activeChat) return;
    const msgText = text;
    setText('');
    try {
      await addDoc(collection(db, `chats/${activeChat.id}/messages`), {
        chatId: activeChat.id,
        senderId: user.uid,
        text: msgText,
        createdAt: serverTimestamp()
      });
      // Skip updating lastMessage in chat doc due to simplicity in rules vs client updates, 
      // but in production we'd do a batch write.
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `chats/${activeChat.id}/messages`);
    }
  };

  const createGroupDemo = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'chats'), {
        participantIds: [user.uid, "demo-user-2"],
        type: "group",
        lastMessage: "Group created!",
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'chats');
    }
  }

  return (
    <div className="flex h-full w-full bg-background relative overflow-hidden">
      {/* Video Call Overlay */}
      <AnimatePresence>
        {isVideoCallActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-8"
          >
            <div className="relative w-full max-w-5xl aspect-video bg-zinc-900 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(124,58,237,0.3)] border border-white/10">
              {/* Remote Video Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                 <Avatar className="w-32 h-32 ring-4 ring-primary/50 shadow-[0_0_30px_rgba(124,58,237,0.5)]">
                   <AvatarFallback className="text-4xl">SQ</AvatarFallback>
                 </Avatar>
              </div>
              
              {/* Local Video Placeholder */}
              <div className="absolute bottom-6 right-6 w-32 md:w-56 aspect-video bg-black rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
                 <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <span className="text-xs bg-black/50 px-2 py-1 rounded backdrop-blur-md text-white">You</span>
                 </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-2xl p-4 rounded-full border border-white/10">
                <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white w-12 h-12"><Phone className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 text-white w-12 h-12"><Video className="w-5 h-5" /></Button>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => setIsVideoCallActive(false)}
                  className="rounded-full w-14 h-14 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="w-20 md:w-80 border-r border-white/5 flex flex-col h-full bg-card/40 backdrop-blur-2xl z-10 glass-panel">
        <div className="hidden md:flex p-6 border-b border-white/5 items-center justify-between">
          <h2 className="text-2xl font-display font-bold neon-text">Chats</h2>
          <Button variant="ghost" size="icon" onClick={createGroupDemo} className="hover:bg-primary/20 hover:text-primary rounded-full"><MoreVertical className="w-5 h-5"/></Button>
        </div>
        <div className="hidden md:block p-4 border-b border-white/5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-muted-foreground" />
            <Input className="w-full bg-black/40 border border-white/10 pl-10 rounded-full h-11 focus-visible:ring-primary shadow-inner" placeholder="Search chats..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
          {chats.map(c => (
            <div 
              key={c.id} 
              onClick={() => setActiveChat(c)}
              className={`p-3 mx-2 my-1 rounded-2xl flex items-center gap-3 cursor-pointer transition-all duration-300 ${activeChat?.id === c.id ? 'bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(124,58,237,0.1)]' : 'hover:bg-white/5 border border-transparent'}`}
            >
              <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-background shadow-md">
                  <AvatarFallback className="bg-gradient-to-tr from-primary/40 to-accent/40 text-white font-bold">{c.type === 'group' ? 'SQ' : 'U'}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              </div>
              <div className="hidden md:flex flex-1 overflow-hidden flex-col">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="font-semibold text-[15px] truncate text-white">{c.type === 'group' ? 'Squad Chat' : 'User'}</h4>
                  <span className="text-[10px] text-primary font-medium tracking-wider">NOW</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.lastMessage || 'Connected to chat'}</p>
              </div>
            </div>
          ))}
          {!user ? (
            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col gap-4">
               <p>Please sign in to view your messages.</p>
            </div>
          ) : chats.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col gap-4">
              <p>No messages yet.</p>
              <Button onClick={createGroupDemo} variant="outline" className="text-primary border-primary/30">Start Chat</Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChat ? (
        <div className="flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="h-20 border-b border-white/5 p-4 flex items-center justify-between bg-card/20 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback>SQ</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Squad Chat</h3>
                <p className="text-xs text-primary">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-white hover:bg-white/10" onClick={() => setIsVideoCallActive(true)}><Phone className="w-5 h-5"/></Button>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-white hover:bg-white/10" onClick={() => setIsVideoCallActive(true)}><Video className="w-5 h-5"/></Button>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-white hover:bg-white/10" onClick={() => setIsChatSettingsOpen(true)}><Settings className="w-5 h-5"/></Button>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map(m => {
              const isMe = m.senderId === user?.uid;
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-secondary text-foreground rounded-bl-none'}`}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5 bg-card/20 backdrop-blur-xl">
            <form onSubmit={sendMessage} className="flex gap-2 relative max-w-4xl mx-auto">
              <Button type="button" variant="ghost" size="icon" className="w-12 h-12 rounded-full border border-white/10 bg-white/5 text-primary hover:bg-white/10 shrink-0 shadow-[0_0_10px_rgba(124,58,237,0.2)]">
                <Sparkles className="w-5 h-5" />
              </Button>
              <Input 
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Message (or ask AI)..." 
                className="flex-1 rounded-full bg-black/40 border border-white/10 h-12 px-6 focus-visible:ring-primary shadow-inner"
              />
              <Button type="submit" size="icon" className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(124,58,237,0.5)] shrink-0">
                <Send className="w-5 h-5 text-white ml-1" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
          <p>Select a chat to start messaging</p>
        </div>
      )}

      {/* Settings Modal Overlay */}
      <AnimatePresence>
        {isChatSettingsOpen && activeChat && (
          <ChatSettingsModal 
            chat={activeChat}
            onClose={() => setIsChatSettingsOpen(false)}
            onLeave={() => {
              setIsChatSettingsOpen(false);
              setActiveChat(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
