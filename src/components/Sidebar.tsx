import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Pin,
  Trash2,
  Download,
  Upload,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  Edit2,
} from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePin: (id: string) => void;
  onExportAll: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenFreeModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onTogglePin,
  onExportAll,
  onImportBackup,
  isOpen,
  onCloseMobile,
  onOpenFreeModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = c.title.toLowerCase().includes(q);
    const messageMatch = c.messages.some((m) => m.content.toLowerCase().includes(q));
    return titleMatch || messageMatch;
  });

  // Group by pinned first, then chronological
  const pinnedList = filteredConversations.filter((c) => c.pinned);
  const unpinnedList = filteredConversations.filter((c) => !c.pinned);

  const startEditing = (c: Conversation) => {
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const saveTitle = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleExportSingle = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    const markdown = `# ${c.title}\n*Exported from NovaAI Chat Assistant on ${new Date(c.createdAt).toLocaleString()}*\n\n---\n\n` +
      c.messages
        .map((m) => `### ${m.role === 'user' ? 'User' : 'NovaAI'}\n*${new Date(m.timestamp).toLocaleTimeString()}*\n\n${m.content}\n\n`)
        .join('---\n\n');

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${c.title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'chat'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ease-in-out lg:static ${
          isOpen
            ? 'w-72 translate-x-0 opacity-100 shadow-xl lg:shadow-none'
            : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 border-r-0 overflow-hidden opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex h-full w-72 flex-col flex-shrink-0">
          {/* Brand & New Chat */}
          <div className="flex flex-col gap-3 p-4 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 text-white shadow-md shadow-cyan-500/20">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                    NovaAI
                    <span className="rounded bg-cyan-950/80 px-1.5 py-0.2 text-[10px] font-medium text-cyan-400 border border-cyan-800/60">
                      Free
                    </span>
                  </h1>
                  <p className="text-[11px] text-slate-400">Daily Chat & Structurer</p>
                </div>
              </div>

              <button
                onClick={onCloseMobile}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Tuck sidebar inside"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </button>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Conversations Scroll Area */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              {searchQuery ? 'No matching conversations' : 'No saved conversations yet'}
            </div>
          ) : (
            <>
              {/* Pinned section */}
              {pinnedList.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Pin className="h-3 w-3 text-cyan-400" />
                    <span>Pinned</span>
                  </div>
                  {pinnedList.map((c) => (
                    <ConversationItem
                      key={c.id}
                      conversation={c}
                      isActive={c.id === activeId}
                      isEditing={editingId === c.id}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      onSelect={() => {
                        onSelectConversation(c.id);
                        onCloseMobile();
                      }}
                      onSaveTitle={() => saveTitle(c.id)}
                      onStartEditing={() => startEditing(c)}
                      onTogglePin={() => onTogglePin(c.id)}
                      onDelete={() => onDeleteConversation(c.id)}
                      onExport={(e) => handleExportSingle(c, e)}
                    />
                  ))}
                </div>
              )}

              {/* Recent section */}
              {unpinnedList.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Recent Conversations
                  </div>
                  {unpinnedList.map((c) => (
                    <ConversationItem
                      key={c.id}
                      conversation={c}
                      isActive={c.id === activeId}
                      isEditing={editingId === c.id}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      onSelect={() => {
                        onSelectConversation(c.id);
                        onCloseMobile();
                      }}
                      onSaveTitle={() => saveTitle(c.id)}
                      onStartEditing={() => startEditing(c)}
                      onTogglePin={() => onTogglePin(c.id)}
                      onDelete={() => onDeleteConversation(c.id)}
                      onExport={(e) => handleExportSingle(c, e)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Free & No Account Trust Banner */}
        <div className="border-t border-slate-800/80 p-3 bg-slate-900/40">
          <button
            onClick={onOpenFreeModal}
            className="w-full flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-left text-xs transition-colors hover:border-cyan-500/50 hover:bg-slate-800/60"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-200 truncate flex items-center gap-1">
                <span>Free & No Sign-In</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[10px] text-slate-400 truncate">Stored locally in your browser</div>
            </div>
          </button>

          {/* Backup & Restore controls */}
          <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-slate-400">
            <button
              onClick={onExportAll}
              className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
              title="Backup all chats to JSON"
            >
              <Download className="h-3 w-3" />
              <span>Backup JSON</span>
            </button>

            <label className="flex items-center gap-1 hover:text-cyan-300 transition-colors cursor-pointer">
              <Upload className="h-3 w-3" />
              <span>Restore</span>
              <input
                type="file"
                accept=".json"
                onChange={onImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (val: string) => void;
  onSelect: () => void;
  onSaveTitle: () => void;
  onStartEditing: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onExport: (e: React.MouseEvent) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  isEditing,
  editTitle,
  setEditTitle,
  onSelect,
  onSaveTitle,
  onStartEditing,
  onTogglePin,
  onDelete,
  onExport,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer ${
        isActive
          ? 'bg-slate-800/90 text-white font-medium shadow-sm border border-slate-700/80'
          : 'text-slate-300 hover:bg-slate-900/90 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <MessageSquare
          className={`h-3.5 w-3.5 flex-shrink-0 ${
            isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
          }`}
        />
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveTitle();
              if (e.key === 'Escape') onSaveTitle();
            }}
            onClick={(e) => e.stopPropagation()}
            onBlur={onSaveTitle}
            autoFocus
            className="w-full rounded bg-slate-950 px-1 py-0.5 text-xs text-white border border-cyan-500 focus:outline-none"
          />
        ) : (
          <span className="truncate">{conversation.title || 'Untitled Chat'}</span>
        )}
      </div>

      {/* Action buttons on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSaveTitle();
            }}
            className="p-1 hover:text-emerald-400"
            title="Save title"
          >
            <Check className="h-3 w-3" />
          </button>
        ) : (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}
              className={`p-1 hover:text-cyan-400 ${
                conversation.pinned ? 'text-cyan-400' : 'text-slate-500'
              }`}
              title={conversation.pinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartEditing();
              }}
              className="p-1 text-slate-500 hover:text-slate-200"
              title="Rename"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={onExport}
              className="p-1 text-slate-500 hover:text-slate-200"
              title="Export as Markdown"
            >
              <Download className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-slate-500 hover:text-rose-400"
              title="Delete chat"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
