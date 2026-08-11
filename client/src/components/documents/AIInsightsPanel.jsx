import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineSparkles,
  HiOutlineShieldExclamation,
  HiOutlineChatBubbleLeftRight,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiPaperAirplane,
  HiArrowPath,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from 'react-icons/hi2';
import { groqSummarize, groqChat, groqExplainFlag } from '../../api/aiApi';
import toast from 'react-hot-toast';

// ─── Risk Flag Badge ─────────────────────────────────────────────────────────
const RiskBadge = ({ severity }) => {
  const map = {
    high: { cls: 'bg-red-500/15 text-red-400 border-red-500/30', Icon: HiOutlineExclamationTriangle },
    medium: { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30', Icon: HiOutlineExclamationTriangle },
    low: { cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', Icon: HiOutlineInformationCircle },
    info: { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', Icon: HiOutlineCheckCircle },
  };
  const { cls, Icon } = map[severity] || map.info;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      <Icon className="w-3 h-3" /> {severity}
    </span>
  );
};

// ─── Chat Message Bubble ─────────────────────────────────────────────────────
const ChatBubble = ({ msg }) => (
  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
    {msg.role === 'assistant' && (
      <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">
        ✦
      </div>
    )}
    <div
      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
        msg.role === 'user'
          ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20'
          : 'bg-slate-800/80 dark:bg-slate-800/80 bg-slate-100 text-slate-800 dark:text-slate-200 border border-slate-700/50 dark:border-slate-700/50 border-slate-200 rounded-tl-none'
      }`}
    >
      {msg.content}
    </div>
  </div>
);

// ─── Main AI Insights Panel ──────────────────────────────────────────────────
export default function AIInsightsPanel({ documentId, fraudMetadata }) {
  const [tab, setTab] = useState('summary');
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hi! I\'ve analyzed this document. Ask me anything — about clauses, risks, parties involved, or anything else you want to understand before signing.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSummarize = async () => {
    setSummaryLoading(true);
    try {
      const res = await groqSummarize(documentId);
      setSummaryData(res.data.data);
      toast.success('AI analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleExplainFlag = async () => {
    setExplainLoading(true);
    try {
      const res = await groqExplainFlag(documentId, fraudMetadata);
      setExplanation(res.data.data.explanation);
    } catch (err) {
      toast.error('Could not generate explanation.');
    } finally {
      setExplainLoading(false);
    }
  };

  const handleChat = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);
    try {
      const historyForApi = chatHistory.filter(m => m.role !== 'assistant' || chatHistory.indexOf(m) > 0);
      const res = await groqChat(
        documentId,
        userMsg,
        historyForApi,
        summaryData ? `Document type: ${summaryData.documentType}\n\nSummary: ${summaryData.summary}\n\nKey Terms: ${summaryData.keyTerms?.map(t => `${t.label}: ${t.value}`).join(', ')}` : ''
      );
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.data.reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that. Please try again.' }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const TABS = [
    { id: 'summary', label: 'Summary', icon: <HiOutlineDocumentMagnifyingGlass /> },
    { id: 'risks', label: 'Risk Flags', icon: <HiOutlineShieldExclamation /> },
    { id: 'chat', label: 'Ask AI', icon: <HiOutlineChatBubbleLeftRight /> },
  ];

  return (
    <div className="bg-slate-900/60 dark:bg-slate-900/60 bg-white border border-indigo-500/20 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl shadow-indigo-500/5">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-800 dark:border-slate-800 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <HiOutlineSparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white dark:text-white text-slate-900 font-semibold text-sm">AI Document Insights</h3>
            <p className="text-xs text-slate-400">Powered by NotaryChain AI Engine</p>
          </div>
          {summaryData && (
            <div className="ml-auto flex items-center gap-2">
              <div className={`text-xs font-bold px-3 py-1 rounded-full border ${
                summaryData.trustScore >= 85 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : summaryData.trustScore >= 60 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                Trust: {summaryData.trustScore}/100
              </div>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 mt-4 bg-slate-950/50 dark:bg-slate-950/50 bg-slate-100 rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">

          {/* ── SUMMARY TAB ── */}
          {tab === 'summary' && (
            <motion.div key="summary" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
              {!summaryData ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                    <HiOutlineSparkles className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h4 className="text-white dark:text-white text-slate-900 font-semibold mb-2">Get AI Analysis</h4>
                  <p className="text-slate-400 text-sm mb-5 max-w-xs mx-auto">
                    Get a plain-language summary, key clauses, and risk assessment in seconds.
                  </p>
                  <button
                    onClick={handleSummarize}
                    disabled={summaryLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-all disabled:opacity-60"
                  >
                    {summaryLoading ? (
                      <><HiArrowPath className="w-4 h-4 animate-spin" /> Analyzing Document...</>
                    ) : (
                      <><HiOutlineSparkles className="w-4 h-4" /> Get AI Summary</>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  {/* Document Type Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold">
                      📄 {summaryData.documentType}
                    </span>
                    <button
                      onClick={handleSummarize}
                      disabled={summaryLoading}
                      className="ml-auto text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                    >
                      <HiArrowPath className={`w-3 h-3 ${summaryLoading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-slate-800/50 dark:bg-slate-800/50 bg-slate-50 border border-slate-700/50 dark:border-slate-700/50 border-slate-200 rounded-xl">
                    <p className="text-slate-200 dark:text-slate-200 text-slate-700 text-sm leading-relaxed">{summaryData.summary}</p>
                  </div>

                  {/* Key Terms */}
                  {summaryData.keyTerms?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Key Terms & Clauses</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {summaryData.keyTerms.map((term, i) => (
                          <div key={i} className="flex items-start justify-between gap-3 py-2.5 px-3 bg-slate-800/30 dark:bg-slate-800/30 bg-slate-50 rounded-lg border border-slate-700/30 dark:border-slate-700/30 border-slate-200">
                            <span className="text-xs text-slate-400 font-medium shrink-0 pt-0.5">{term.label}</span>
                            <span className="text-xs text-slate-200 dark:text-slate-200 text-slate-700 text-right font-medium">{term.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── RISK FLAGS TAB ── */}
          {tab === 'risks' && (
            <motion.div key="risks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              {!summaryData ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <HiOutlineShieldExclamation className="w-8 h-8 text-amber-400" />
                  </div>
                  <p className="text-slate-400 text-sm mb-5">Run the AI analysis first to see risk flags.</p>
                  <button
                    onClick={() => { setTab('summary'); setTimeout(handleSummarize, 100); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-500 transition-colors"
                  >
                    <HiOutlineSparkles className="w-4 h-4" /> Run Analysis First
                  </button>
                </div>
              ) : (
                <>
                  {summaryData.riskFlags?.length === 0 ? (
                    <div className="text-center py-6">
                      <HiOutlineCheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                      <p className="text-emerald-400 font-semibold">No significant risk flags detected</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {summaryData.riskFlags.map((flag, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`p-4 rounded-xl border flex items-start gap-3 ${
                            flag.severity === 'high' ? 'bg-red-500/8 border-red-500/25'
                            : flag.severity === 'medium' ? 'bg-amber-500/8 border-amber-500/25'
                            : flag.severity === 'low' ? 'bg-yellow-500/8 border-yellow-500/25'
                            : 'bg-emerald-500/8 border-emerald-500/25'
                          }`}
                        >
                          <RiskBadge severity={flag.severity} />
                          <p className="text-sm text-slate-300 dark:text-slate-300 text-slate-600 leading-relaxed">{flag.flag}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Explain Flag button */}
                  <div className="pt-2 border-t border-slate-800 dark:border-slate-800 border-slate-200">
                    <button
                      onClick={handleExplainFlag}
                      disabled={explainLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800/60 dark:bg-slate-800/60 bg-slate-100 hover:bg-slate-700/60 text-slate-300 dark:text-slate-300 text-slate-600 text-sm font-medium rounded-xl border border-slate-700/50 dark:border-slate-700/50 border-slate-200 transition-colors"
                    >
                      {explainLoading ? <HiArrowPath className="w-4 h-4 animate-spin" /> : <HiOutlineShieldExclamation className="w-4 h-4" />}
                      Why was this flagged?
                    </button>
                    {explanation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 p-4 bg-slate-800/40 dark:bg-slate-800/40 bg-slate-50 border border-slate-700/40 dark:border-slate-700/40 border-slate-200 rounded-xl"
                      >
                        <p className="text-sm text-slate-300 dark:text-slate-300 text-slate-600 leading-relaxed whitespace-pre-line">{explanation}</p>
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── CHAT TAB ── */}
          {tab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col">
              {/* Chat Messages */}
              <div className="h-72 overflow-y-auto pr-1 space-y-1 mb-4 scroll-smooth">
                {chatHistory.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                {chatLoading && (
                  <div className="flex justify-start mb-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs mr-2 mt-0.5">✦</div>
                    <div className="bg-slate-800/80 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700/50 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick prompts */}
              <div className="flex gap-2 flex-wrap mb-3">
                {['Is there a termination clause?', 'What are the payment terms?', 'Any red flags?'].map(q => (
                  <button
                    key={q}
                    onClick={() => { setChatInput(q); setTimeout(() => handleChat(), 50); }}
                    disabled={chatLoading}
                    className="text-[11px] px-3 py-1.5 bg-slate-800/60 dark:bg-slate-800/60 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-400 dark:text-slate-400 border border-slate-700/50 dark:border-slate-700/50 border-slate-200 rounded-full transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChat} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask about this document..."
                  disabled={chatLoading}
                  className="flex-1 px-4 py-2.5 bg-slate-800/60 dark:bg-slate-800/60 bg-slate-100 border border-slate-700/50 dark:border-slate-700/50 border-slate-200 rounded-xl text-sm text-white dark:text-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-indigo-500/20"
                >
                  <HiPaperAirplane className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
