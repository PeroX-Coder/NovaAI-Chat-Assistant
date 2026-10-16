import React from 'react';
import {
  X,
  Sparkles,
  Zap,
  LayoutGrid,
  FileText,
  PenTool,
  Brain,
  Check,
} from 'lucide-react';
import { PersonaRole } from '../types';
import { PERSONA_ROLES } from '../constants/personas';

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRole: PersonaRole;
  onSelectRole: (role: PersonaRole) => void;
}

const getRoleIcon = (iconName: string) => {
  switch (iconName) {
    case 'Zap':
      return <Zap className="h-5 w-5 text-amber-400" />;
    case 'LayoutGrid':
      return <LayoutGrid className="h-5 w-5 text-cyan-400" />;
    case 'FileText':
      return <FileText className="h-5 w-5 text-emerald-400" />;
    case 'PenTool':
      return <PenTool className="h-5 w-5 text-purple-400" />;
    case 'Brain':
      return <Brain className="h-5 w-5 text-indigo-400" />;
    case 'Sparkles':
    default:
      return <Sparkles className="h-5 w-5 text-cyan-400" />;
  }
};

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedRole,
  onSelectRole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              Choose NovaAI Assistant Role
            </h2>
            <p className="text-xs text-slate-400">
              Each persona tunes NovaAI's focus to specialize in specific everyday tasks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Roles List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {PERSONA_ROLES.map((role) => {
            const isSelected = role.id === selectedRole.id;

            return (
              <div
                key={role.id}
                onClick={() => {
                  onSelectRole(role);
                  onClose();
                }}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500/80 bg-slate-800/90 shadow-md ring-1 ring-cyan-500/30'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-sm mt-0.5 sm:mt-0">
                    {getRoleIcon(role.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        {role.name}
                      </h3>
                      {isSelected && (
                        <span className="flex items-center gap-1 rounded-full bg-cyan-950/80 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/60">
                          <Check className="h-3 w-3" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cyan-300/90 mt-0.5">{role.tagline}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`flex-shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Use Role'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
