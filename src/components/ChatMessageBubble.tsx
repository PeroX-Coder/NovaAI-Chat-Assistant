import React, { useState } from 'react';
import { Bot, User, Copy, Check, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isLatestAssistant?: boolean;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isLatestAssistant,
  isStreaming,
  onRegenerate,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = message.content.replace(/[#*`_[\]()]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`group flex w-full gap-3 py-4 transition-colors ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className="relative flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 text-white shadow-md ring-1 ring-cyan-400/30">
            <Bot className="h-5 w-5" />
          </div>
          {isStreaming && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          )}
        </div>
      )}

      <div
        className={`flex max-w-[88%] md:max-w-[78%] flex-col ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Author & Timestamp Header */}
        <div className="mb-1.5 flex items-center gap-2 px-1 text-xs text-slate-400">
          <span className="font-medium text-slate-300">
            {isUser ? 'You' : ''}
          </span>
          <span>{formatTime(message.timestamp)}</span>
        </div>

        {/* Message Content Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-3.5 shadow-sm text-sm ${
            isUser
              ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none'
              : 'border border-slate-800/90 bg-slate-900/90 text-slate-100 rounded-tl-none ring-1 ring-white/5 backdrop-blur-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed break-words">{message.content}</p>
          ) : (
            <>
              {message.content ? (
                <MarkdownRenderer content={message.content} />
              ) : isStreaming ? (
                <div className="flex items-center gap-2 py-2 text-slate-400">
                  <Sparkles className="h-4 w-4 animate-spin text-cyan-400" />
                  <span className="text-xs font-mono">Nova is structuring answer...</span>
                </div>
              ) : null}

              {isStreaming && message.content && (
                <span className="inline-block h-4 w-1.5 animate-pulse bg-cyan-400 ml-1 rounded-sm align-middle" />
              )}
            </>
          )}
        </div>

        {/* Action Toolbar on Bottom */}
        {!isUser && message.content && !isStreaming && (
          <div className="mt-1.5 flex items-center gap-1 px-1 opacity-90 transition-opacity">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="Copy answer"
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

            {'speechSynthesis' in window && (
              <button
                onClick={handleToggleSpeech}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-colors ${
                  isSpeaking
                    ? 'text-cyan-400 bg-cyan-950/40'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={isSpeaking ? 'Stop reading' : 'Read aloud'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Listen</span>
                  </>
                )}
              </button>
            )}

            {isLatestAssistant && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                title="Regenerate response"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300 shadow-sm border border-slate-700">
            <User className="h-5 w-5" />
          </div>
        </div>
      )}
    </div>
  );
};
