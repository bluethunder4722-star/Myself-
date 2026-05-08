import React from "react";
import { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function AIAssistant() {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "Hello! I'm Genesis, your MYSELF super-app AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMessage,
      });
      
      const text = response.text || "I'm not sure how to respond to that.";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Connection error. Please ensure API key is configured." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col relative bg-background/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-card/10 backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold neon-text">Genesis AI</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-accent" /> Powered by Gemini
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar relative z-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] md:max-w-[70%] p-5 rounded-3xl ${
                  m.role === 'user' 
                    ? 'bg-primary text-white rounded-br-sm shadow-[0_0_15px_rgba(124,58,237,0.4)]' 
                    : 'bg-card/40 backdrop-blur-md border border-white/10 text-foreground rounded-bl-sm'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl rounded-bl-sm p-5 animate-pulse">
                <div className="flex gap-2 items-center h-6">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 md:p-8 relative z-10 bg-gradient-to-t from-background via-background to-transparent pt-12">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-accent opacity-30 group-hover:opacity-60 blur transition duration-500"/>
          <div className="relative flex items-center bg-card/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 pr-3 pl-6 shadow-2xl">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..." 
              className="flex-1 bg-transparent border-none focus-visible:ring-0 text-base py-4"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="rounded-full w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-primary to-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
