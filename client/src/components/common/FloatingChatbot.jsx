import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Minus, Send, Sparkles } from 'lucide-react';
import { groqChat } from '../../api/aiApi';

const ChatBubble = ({ msg }) => (
  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2.5`}>
    {msg.role === 'assistant' && (
      <div className="w-6 h-6 rounded-full bg-[#F0FAF5] border border-[#B3E4CC] text-[#2D6A4F] flex items-center justify-center text-[10px] mr-2 mt-0.5 shrink-0 font-bold">
        ✦
      </div>
    )}
    <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
      msg.role === 'user'
        ? 'bg-[#2D6A4F] text-white rounded-tr-xs shadow-xs font-medium'
        : 'bg-[#F6F3EE] text-[#2E2A26] border border-[#E8E2DA] rounded-tl-xs font-medium'
    }`}>
      {msg.content}
    </div>
  </div>
);

export default function FloatingChatbot({ documentId = null, documentContext = '' }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [history, setHistory] = useState([
    {
      role: 'assistant',
      content: documentId
        ? "Hi! I'm your document assistant. I've loaded this document's context — ask me anything about it before you sign."
        : "Hi! I'm NotaryChain's AI assistant. I can help you upload documents, understand the verification process, or explain how notarization works. What do you need?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && !minimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, open, minimized]);

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, minimized]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await groqChat(documentId, userMsg, history.slice(-8), documentContext);
      const reply = res?.data?.data?.reply || res?.data?.reply || res?.reply || "NotaryChain AI is ready. Ask me anything about document verification or notarization!";
      setHistory(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      if (err.response?.status === 429 || err.response?.data?.code === 'RATE_LIMITED') {
        const retrySec = err.response?.data?.retryAfter || 10;
        setHistory(prev => [...prev, { role: 'assistant', content: `⏳ AI service is temporarily rate-limited. Please wait ${retrySec} seconds before sending another message.` }]);
      } else {
        setHistory(prev => [...prev, { role: 'assistant', content: "NotaryChain AI is ready. You can ask about document verification, SHA-256 hashing, or Polygon Neobank transactions!" }]);
      }
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const quickPrompts = documentId
    ? ['Summarize key risks', 'Who are the parties?', 'Any missing clauses?']
    : ['How do I upload a document?', 'What is notarization?', 'How does fraud detection work?'];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-13 h-13 rounded-2xl bg-[#2D6A4F] text-white shadow-card-lg flex items-center justify-center border border-[#1B4532]"
            aria-label="Open AI Assistant"
          >
            <MessageSquare className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] rounded-2xl bg-white border border-[#E8E2DA] shadow-card-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#F0FAF5] border-b border-[#E8E2DA]">
              <div className="w-8 h-8 rounded-xl bg-[#2D6A4F] flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#2E2A26] text-xs font-bold leading-tight font-display">
                  {documentId ? 'Document Assistant' : 'NotaryChain AI'}
                </p>
                <p className="text-[#2D6A4F] text-[10px] font-medium">Llama 3.3 · Always online</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMinimized(v => !v)}
                  className="p-1 rounded-lg text-[#7B746E] hover:text-[#2E2A26] hover:bg-[#E8E2DA]/50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg text-[#7B746E] hover:text-[#2E2A26] hover:bg-[#E8E2DA]/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body (collapsible) */}
            <AnimatePresence>
              {!minimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  {/* Messages */}
                  <div className="h-72 overflow-y-auto p-4 space-y-1 scroll-smooth ai-chat-scroll">
                    {history.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                    {loading && (
                      <div className="flex justify-start mb-2">
                        <div className="w-6 h-6 rounded-full bg-[#F0FAF5] border border-[#B3E4CC] text-[#2D6A4F] flex items-center justify-center text-[10px] mr-2 mt-0.5 font-bold">✦</div>
                        <div className="bg-[#F6F3EE] rounded-2xl rounded-tl-xs px-3.5 py-2.5 border border-[#E8E2DA] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-[#2D6A4F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#2D6A4F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#2D6A4F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Prompts */}
                  <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
                    {quickPrompts.map(q => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); setTimeout(() => sendMessage(), 50); }}
                        disabled={loading}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#F6F3EE] border border-[#E8E2DA] text-[#55504B] hover:bg-[#2D6A4F] hover:text-white hover:border-[#2D6A4F] transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="px-4 pb-4">
                    <form onSubmit={sendMessage} className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        disabled={loading}
                        className="flex-1 px-3.5 py-2.5 bg-[#F6F3EE] border border-[#E8E2DA] rounded-xl text-xs text-[#2E2A26] placeholder-[#7B746E] focus:bg-white focus:outline-none focus:border-[#2D6A4F] transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="p-2.5 bg-[#2D6A4F] hover:bg-[#245741] text-white rounded-xl transition-all disabled:opacity-40 shadow-xs flex-shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
