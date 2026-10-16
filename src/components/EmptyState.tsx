import React from 'react';
import {
  Sparkles,
  Zap,
  LayoutGrid,
  FileText,
  Calendar,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { PersonaRole } from '../types';

interface EmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
  activeRole: PersonaRole;
  onOpenStructureModal: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectPrompt,
  activeRole,
  onOpenStructureModal,
}) => {
  const starterCategories = [
    {
      title: 'Quick Shots',
      badge: 'Zero Fluff',
      icon: <Zap className="h-4 w-4 text-amber-400" />,
      color: 'from-amber-500/10 to-transparent border-amber-500/20 hover:border-amber-500/40',
      prompts: [
        'TL;DR: Difference between RAM and SSD storage in 3 bullets',
        'Quick decision matrix: Lease vs Buy a car pros & cons',
        'Top 3 healthiest high-protein breakfast ideas under 10 mins',
      ],
    },
    {
      title: 'Structure Complex Text',
      badge: 'Tables & Plans',
      icon: <LayoutGrid className="h-4 w-4 text-cyan-400" />,
      color: 'from-cyan-500/10 to-transparent border-cyan-500/20 hover:border-cyan-500/40',
      prompts: [
        'Turn these unorganized notes into a clean Markdown table with priorities',
        'Extract action items, deadlines, and owners from a project briefing',
        'Structure a messy customer feedback log into bug vs feature request matrix',
      ],
    },
    {
      title: 'Smart Summarizer',
      badge: 'Core Insights',
      icon: <FileText className="h-4 w-4 text-emerald-400" />,
      color: 'from-emerald-500/10 to-transparent border-emerald-500/20 hover:border-emerald-500/40',
      prompts: [
        'Give me a 30-second executive summary of how generative AI works',
        'Summarize this long email chain into 3 critical decision points',
        'Distill a complicated contract clause into plain English',
      ],
    },
    {
      title: 'Daily Tasks & Answers',
      badge: 'Practical Help',
      icon: <Calendar className="h-4 w-4 text-indigo-400" />,
      color: 'from-indigo-500/10 to-transparent border-indigo-500/20 hover:border-indigo-500/40',
      prompts: [
        'Plan a focused 4-hour morning schedule for deep analytical work',
        'Draft a polite email declining a meeting invite due to conflicting priorities',
        'Step-by-step checklist to prepare for an apartment move',
      ],
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto my-auto text-center">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs text-cyan-300 shadow-sm backdrop-blur-sm mb-4">
        <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
        <span>NovaAI Daily Chat Assistant</span>
        <span className="h-1 w-1 rounded-full bg-cyan-400" />
        <span className="font-semibold text-emerald-400">100% Free & No Account Needed</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
        Meet <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">NovaAI</span> Chat Assistant
      </h1>
      <p className="max-w-xl text-sm md:text-base text-slate-300 mb-6 leading-relaxed">
        Fast answers for daily tasks, rapid summarization, and intelligent structuring of complex texts into clean tables and action plans.
      </p>

      {/* Trust Highlights */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 mb-8">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>No sign-up or login required</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>Multi-turn conversational memory</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>Private local browser storage</span>
        </div>
      </div>

      {/* Role specific callout */}
      {activeRole.id !== 'daily-assistant' && (
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-xs text-slate-300 max-w-lg">
          <span className="font-semibold text-cyan-300">Active Persona:</span>{' '}
          {activeRole.name} — <span className="text-slate-400">{activeRole.tagline}</span>
        </div>
      )}

      {/* Categorized Starter Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full text-left">
        {starterCategories.map((cat, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border bg-gradient-to-b ${cat.color} bg-slate-900/60 p-4 transition-all shadow-md backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-slate-800/80 p-1.5 ring-1 ring-white/10">
                  {cat.icon}
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {cat.title}
                </h2>
              </div>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-700/60">
                {cat.badge}
              </span>
            </div>

            <div className="space-y-1.5">
              {cat.prompts.map((p, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => onSelectPrompt(p)}
                  className="group flex w-full items-center justify-between rounded-xl bg-slate-950/60 px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-slate-800/90 hover:text-white border border-slate-800/60"
                >
                  <span className="truncate pr-2">{p}</span>
                  <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Structurer CTA banner */}
      <div className="mt-6 w-full rounded-2xl border border-cyan-800/50 bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-900 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Have a blob of messy text?</h3>
            <p className="text-xs text-slate-400">
              Paste meeting notes, emails, or raw data to convert them into structured tables & summaries instantly.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenStructureModal}
          className="flex-shrink-0 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md transition-all hover:bg-cyan-400 active:scale-95"
        >
          Open Structurer
        </button>
      </div>
    </div>
  );
};
