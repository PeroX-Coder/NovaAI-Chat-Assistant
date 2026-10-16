import React, { useState } from 'react';
import {
  X,
  Table,
  Zap,
  CheckSquare,
  Lightbulb,
  Copy,
  Check,
  Send,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface QuickStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToChat: (structuredText: string) => void;
}

export const QuickStructureModal: React.FC<QuickStructureModalProps> = ({
  isOpen,
  onClose,
  onInsertToChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'table' | 'summary' | 'action_items' | 'simplify' | 'structure'>('table');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleTexts = {
    notes: `Meeting with marketing & product team on Tuesday at 2pm. Sarah said redesign is delayed by 2 weeks because backend API is not ready. David needs to finish user authentication endpoints by Friday. Budget for ads was approved at $5,000 for Instagram and $3,500 for Google Search. Need to schedule follow-up with CEO next Monday morning. John should review analytics dashboard metrics and email a report by Thursday. Launch date pushed from Oct 20 to Nov 4.`,
    dense: `Photosynthesis is a biological process utilized by plant life and other autotrophic entities to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel the organism's metabolic activities. This chemical energy is stored in carbohydrate molecules, such as sugars and starches, which are synthesized from carbon dioxide and water. Oxygen is released as a waste product. Most plants, algae, and cyanobacteria perform photosynthesis; such organisms are called photoautotrophs.`,
  };

  const modes = [
    { id: 'table', label: 'Table & Highlights', icon: <Table className="h-4 w-4" /> },
    { id: 'summary', label: '30-Sec Summary', icon: <Zap className="h-4 w-4" /> },
    { id: 'action_items', label: 'Action Checklist', icon: <CheckSquare className="h-4 w-4" /> },
    { id: 'simplify', label: 'Plain English (ELI10)', icon: <Lightbulb className="h-4 w-4" /> },
    { id: 'structure', label: 'Full Structure', icon: <Sparkles className="h-4 w-4" /> },
  ] as const;

  const handleStructure = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/structure-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, mode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to structure text');
      }
      setResult(data.result);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleSendToChat = () => {
    if (!result) return;
    onInsertToChat(result);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Table className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Instant Text Structurer & Summarizer</h2>
              <p className="text-xs text-slate-400">
                Transform messy, dense, or unorganized text into clean tables, action items, or crisp summaries.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Format Selector Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Output Structure
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    mode === m.id
                      ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Raw Input Text:
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setInputText(sampleTexts.notes)}
                  className="text-cyan-400 hover:underline"
                >
                  Load Sample Notes
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => setInputText('')}
                  className="text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste unstructured notes, meeting transcripts, long emails, complex articles, or messy bullet points..."
              rows={4}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 leading-relaxed"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={handleStructure}
              disabled={isProcessing || !inputText.trim()}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-md transition-all active:scale-95 ${
                isProcessing || !inputText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:brightness-110 shadow-cyan-500/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin text-cyan-300" />
                  <span>Structuring with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Structure Text Now</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-rose-800/80 bg-rose-950/40 p-3 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Structured Output Result */}
          {result && (
            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/90 p-4 shadow-inner space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400" />
                  Structured Output
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSendToChat}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Insert into Chat</span>
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto pr-1">
                <MarkdownRenderer content={result} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
