import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Minus, Send, Sparkles } from 'lucide-react';
import { groqChat } from '../../api/aiApi';

function formatInlineText(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-bold text-[#1B4532]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx} className="px-1 py-0.5 rounded bg-[#E8E2DA]/60 text-[11px] font-mono text-[#2D6A4F]">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function FormattedContent({ content, isUser }) {
  if (!content) return null;
  if (isUser) return <span>{content}</span>;

  const lines = content.split('\n');
  const elements = [];
  let tableRows = [];
  let listItems = [];

  const flushTable = (key) => {
    if (tableRows.length === 0) return;
    const headerRow = tableRows[0];
    const bodyRows = tableRows.slice(1).filter(r => !r.every(c => /^[-:\s]+$/.test(c)));

    elements.push(
      <div key={`table-${key}`} className="my-2.5 overflow-x-auto rounded-xl border border-[#E8E2DA] bg-white shadow-2xs">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-[#F0FAF5] border-b border-[#E8E2DA]">
              {headerRow.map((col, cIdx) => (
                <th key={cIdx} className="px-2.5 py-1.5 font-bold text-[#2D6A4F]">
                  {formatInlineText(col.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className={`border-b border-[#E8E2DA]/50 last:border-0 ${rIdx % 2 === 0 ? 'bg-white' : 'bg-[#FDFCFB]'}`}>
                {row.map((col, cIdx) => (
                  <td key={cIdx} className="px-2.5 py-1.5 text-[#2E2A26] align-top">
                    {formatInlineText(col.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  };

  const flushList = (key) => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={`list-${key}`} className="my-1.5 space-y-1 pl-1">
        {listItems.map((item, iIdx) => (
          <li key={iIdx} className="flex items-start gap-1.5 text-[12px] text-[#2E2A26]">
            <span className="text-[#2D6A4F] text-[10px] mt-0.5 shrink-0">●</span>
            <span>{formatInlineText(item)}</span>
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Table line: | col 1 | col 2 |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(idx);
      const cells = trimmed.slice(1, -1).split('|').map(c => c.trim());
      tableRows.push(cells);
      return;
    } else {
      flushTable(idx);
    }

    // List item: - item or * item or 1. item
    if (/^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      flushTable(idx);
      const itemText = trimmed.replace(/^[-*•]\s+|\d+\.\s+/, '');
      listItems.push(itemText);
      return;
    } else {
      flushList(idx);
    }

    if (!trimmed) {
      elements.push(<div key={idx} className="h-1" />);
      return;
    }

    // Headers: ### Header
    if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      const headerText = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <h4 key={idx} className="font-display font-bold text-[13px] text-[#1B4532] mt-2 mb-1">
          {formatInlineText(headerText)}
        </h4>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={idx} className="my-1 text-[12px] leading-relaxed text-[#2E2A26]">
        {formatInlineText(trimmed)}
      </p>
    );
  });

  flushTable('final');
  flushList('final');

  return <div className="space-y-0.5">{elements}</div>;
}

const ChatBubble = ({ msg }) => (
  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
    {msg.role === 'assistant' && (
      <div className="w-6 h-6 rounded-full bg-[#F0FAF5] border border-[#B3E4CC] text-[#2D6A4F] flex items-center justify-center text-[10px] mr-2 mt-0.5 shrink-0 font-bold">
        ✦
      </div>
    )}
    <div className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed ${
      msg.role === 'user'
        ? 'bg-[#2D6A4F] text-white rounded-tr-xs shadow-xs font-medium'
        : 'bg-[#F6F3EE] text-[#2E2A26] border border-[#E8E2DA] rounded-tl-xs shadow-2xs'
    }`}>
      <FormattedContent content={msg.content} isUser={msg.role === 'user'} />
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

  const OFF_TOPIC_REJECTION = "I only give information about NotaryChain, document verification, blockchain anchoring, face biometrics, and Polygon Neobank payments.";

  const isOffTopic = (text) => {
    const q = text.toLowerCase();
    const triggers = [
      'python', 'java ', 'c++', 'javascript code', 'write code', 'array code',
      'recipe', 'joke', 'movie', 'weather', 'song', 'lyrics', 'solve math',
      'who is president', 'who won'
    ];
    if (triggers.some(t => q.includes(t))) {
      if (!q.includes('notary') && !q.includes('chain') && !q.includes('polygon') && !q.includes('hash')) {
        return true;
      }
    }
    return false;
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);

    if (isOffTopic(userMsg)) {
      setHistory(prev => [...prev, { role: 'assistant', content: OFF_TOPIC_REJECTION }]);
      return;
    }

    setLoading(true);
    try {
      const res = await groqChat(documentId, userMsg, history.slice(-8), documentContext);
      let reply = res?.data?.data?.reply || res?.data?.reply || res?.reply || OFF_TOPIC_REJECTION;
      if (isOffTopic(reply) || reply.includes('```python') || reply.includes('```javascript') || reply.includes('my_array =')) {
        reply = OFF_TOPIC_REJECTION;
      }
      setHistory(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      if (err.response?.status === 429 || err.response?.data?.code === 'RATE_LIMITED') {
        const retrySec = err.response?.data?.retryAfter || 10;
        setHistory(prev => [...prev, { role: 'assistant', content: `⏳ AI service is temporarily rate-limited. Please wait ${retrySec} seconds before sending another message.` }]);
      } else {
        setHistory(prev => [...prev, { role: 'assistant', content: OFF_TOPIC_REJECTION }]);
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
            className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[420px] rounded-2xl bg-white border border-[#E8E2DA] shadow-card-lg overflow-hidden flex flex-col max-h-[85vh]"
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
                <p className="text-[#2D6A4F] text-[10px] font-medium">NotaryChain AI · Always online</p>
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
