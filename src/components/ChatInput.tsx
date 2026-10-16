import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square, Zap, Table, Sparkles } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onStop: () => void;
  isQuickShotMode: boolean;
  onToggleQuickShotMode: () => void;
  onOpenStructureModal: () => void;
  activeRoleName: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
  onStop,
  isQuickShotMode,
  onToggleQuickShotMode,
  onOpenStructureModal,
  activeRoleName,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 pb-3 pt-1">
      {/* Quick Access Bar */}
      <div className="mb-2 flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {/* Quick Shot Toggle */}
          <button
            onClick={onToggleQuickShotMode}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
              isQuickShotMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
            title="Fast, ultra-dense micro-answers using Gemini Flash 1.5"
          >
            <Zap className={`h-3 w-3 ${isQuickShotMode ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span>Quick Shot Mode</span>
            {isQuickShotMode && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
          </button>

          {/* Paste & Structure Tool */}
          <button
            onClick={onOpenStructureModal}
            className="flex items-center gap-1.5 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs text-slate-400 border border-slate-800 hover:text-cyan-300 hover:border-cyan-800/60 transition-colors"
          >
            <Table className="h-3 w-3 text-cyan-400" />
            <span>Paste & Structure Text</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
          <span>Active: <span className="text-slate-400 font-medium">{activeRoleName}</span></span>
        </div>
      </div>

      {/* Main Input Box */}
      <div className="relative rounded-2xl border border-slate-700/80 bg-slate-900/90 shadow-lg shadow-black/40 ring-1 ring-white/5 focus-within:border-cyan-500/80 focus-within:ring-cyan-500/20 backdrop-blur-md transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isQuickShotMode
              ? 'Ask for a quick shot (instant answer, 3 bullets, TL;DR)...'
              : 'Ask Nova anything, paste messy notes to structure, request a summary, or get daily help...'
          }
          rows={1}
          className="w-full resize-none bg-transparent px-4 py-3.5 pr-24 text-sm text-slate-100 placeholder-slate-500 focus:outline-none max-h-48 scrollbar-thin leading-relaxed"
        />

        {/* Action Controls inside the box */}
        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          {isLoading ? (
            <button
              onClick={onStop}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md hover:bg-rose-500 transition-colors active:scale-95"
              title="Stop generation"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!input.trim()}
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all shadow-md active:scale-95 ${
                input.trim()
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:brightness-110 shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Send message (Enter)"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-1.5 flex items-center justify-between px-2 text-[10px] text-slate-500">
        <div className="flex items-center gap-2">
          <span>Enter to send • Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
};
