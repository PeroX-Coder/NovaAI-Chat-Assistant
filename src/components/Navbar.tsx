import React from 'react';
import {
  Menu,
  Sparkles,
  Zap,
  LayoutGrid,
  FileText,
  PenTool,
  Brain,
  ChevronDown,
  Table,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { PersonaRole } from '../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  selectedRole: PersonaRole;
  onOpenRoleModal: () => void;
  onOpenStructureModal: () => void;
  onOpenFreeModal: () => void;
  onResetChat: () => void;
  hasMessages: boolean;
}

const getRoleIcon = (iconName: string) => {
  switch (iconName) {
    case 'Zap':
      return <Zap className="h-3.5 w-3.5 text-amber-400" />;
    case 'LayoutGrid':
      return <LayoutGrid className="h-3.5 w-3.5 text-cyan-400" />;
    case 'FileText':
      return <FileText className="h-3.5 w-3.5 text-emerald-400" />;
    case 'PenTool':
      return <PenTool className="h-3.5 w-3.5 text-purple-400" />;
    case 'Brain':
      return <Brain className="h-3.5 w-3.5 text-indigo-400" />;
    case 'Sparkles':
    default:
      return <Sparkles className="h-3.5 w-3.5 text-cyan-400" />;
  }
};

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  selectedRole,
  onOpenRoleModal,
  onOpenStructureModal,
  onOpenFreeModal,
  onResetChat,
  hasMessages,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-3 md:px-4 backdrop-blur-md">
      {/* Left section: Sidebar toggle & Persona role switcher */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 text-slate-300 transition-all hover:bg-slate-800 hover:text-white hover:border-slate-700 active:scale-95 shadow-sm"
          title="Toggle Sidebar (Inside / Outside)"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Role Selector Button */}
        <button
          onClick={onOpenRoleModal}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200 transition-colors hover:border-cyan-500/50 hover:bg-slate-800"
          title="Switch Assistant Role / Persona"
        >
          {getRoleIcon(selectedRole.icon)}
          <span className="font-medium hidden sm:inline">{selectedRole.shortName}</span>
          <span className="font-medium sm:hidden">Role</span>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </button>

        {/* Quick Structure Tool shortcut */}
        <button
          onClick={onOpenStructureModal}
          className="hidden md:flex items-center gap-1.5 rounded-xl border border-cyan-800/50 bg-cyan-950/30 px-2.5 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-900/40"
          title="Transform messy text into structured tables & summaries"
        >
          <Table className="h-3.5 w-3.5" />
          <span>Structure Text Tool</span>
        </button>
      </div>

      {/* Right section: Free badge and Actions */}
      <div className="flex items-center gap-2">
        {/* Free & No Account Badge */}
        <button
          onClick={onOpenFreeModal}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-900/50 bg-emerald-950/30 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-900/40"
          title="Free forever • No account required"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">100% Free</span>
        </button>

        {/* Clear/Reset Current Chat */}
        {hasMessages && (
          <button
            onClick={onResetChat}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
            title="Start fresh conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
};
