import React from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Sparkles,
  Zap,
  Lock,
} from 'lucide-react';

interface FreeBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FreeBadgeModal: React.FC<FreeBadgeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-lg rounded-2xl border border-emerald-900/60 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-gradient-to-r from-emerald-950/40 to-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">100% Free • No Account Needed</h2>
              <p className="text-xs text-emerald-400 font-medium">Instant Open Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          <p className="text-sm text-slate-200 leading-relaxed">
            NovaAI Chat Assistant is designed to be completely free, frictionless, and accessible right away:
          </p>

          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">No Account or Registration:</strong>
                <p className="text-slate-400 mt-0.5">
                  You can start chatting, summarizing, and structuring text right away. No email, sign-up forms, or passwords required.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <HardDrive className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Private Local Storage:</strong>
                <p className="text-slate-400 mt-0.5">
                  Your chat history stays stored securely in your browser's local storage. You can backup, export as Markdown, or delete threads anytime.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Full Feature Access:</strong>
                <p className="text-slate-400 mt-0.5">
                  All features are available for free: multi-turn conversation memory, Quick Shot micro-answers, complex text structurer, executive summaries, and role personas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Powered by NovaAI Engine:</strong>
                <p className="text-slate-400 mt-0.5">
                  Engineered with Google Gemini Flash 1.5 for rapid, intelligent daily task performance and information structuring.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="rounded-xl bg-cyan-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shadow-md active:scale-95"
            >
              Start Chatting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
