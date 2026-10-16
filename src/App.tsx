/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Conversation, ChatMessage, PersonaRole } from './types';
import { PERSONA_ROLES, DEFAULT_ROLE } from './constants/personas';
import { DEFAULT_MODEL } from './constants/models';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ChatMessageBubble } from './components/ChatMessageBubble';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { QuickStructureModal } from './components/QuickStructureModal';
import { RoleSelectorModal } from './components/RoleSelectorModal';
import { FreeBadgeModal } from './components/FreeBadgeModal';

const STORAGE_KEY = 'nova_ai_conversations_v1';
const ACTIVE_CONV_KEY = 'nova_ai_active_conv_id';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeConvId, setActiveConvId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_CONV_KEY);
    } catch {
      return null;
    }
  });

  const [selectedRole, setSelectedRole] = useState<PersonaRole>(DEFAULT_ROLE);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuickShotMode, setIsQuickShotMode] = useState(false);

  // Modals & Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isFreeModalOpen, setIsFreeModalOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar inside / outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Persist conversations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations to localStorage', e);
    }
  }, [conversations]);

  // Persist active ID
  useEffect(() => {
    if (activeConvId) {
      localStorage.setItem(ACTIVE_CONV_KEY, activeConvId);
    } else {
      localStorage.removeItem(ACTIVE_CONV_KEY);
    }
  }, [activeConvId]);

  // Find active conversation
  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const messages = activeConversation?.messages || [];

  // Sync role from active conversation
  useEffect(() => {
    if (activeConversation?.roleId) {
      const role = PERSONA_ROLES.find((r) => r.id === activeConversation.roleId);
      if (role) setSelectedRole(role);
    }
  }, [activeConvId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, shouldAutoScroll]);

  // Detect user manual scroll up
  const handleScroll = () => {
    if (!chatScrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShouldAutoScroll(isAtBottom);
  };

  const createNewConversation = (initialTitle = 'New Conversation'): Conversation => {
    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: initialTitle,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: DEFAULT_MODEL,
      roleId: selectedRole.id,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    return newConv;
  };

  const handleStartNewChat = () => {
    if (isLoading) {
      handleStopGeneration();
    }
    const newConv = createNewConversation();
    setActiveConvId(newConv.id);
    setInput('');
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveConvId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleTogglePin = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const handleExportAll = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nova_ai_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setConversations(parsed);
            if (parsed.length > 0) setActiveConvId(parsed[0].id);
          }
        } catch {
          alert('Invalid backup file format');
        }
      };
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleToggleQuickShotMode = () => {
    if (!isQuickShotMode) {
      setIsQuickShotMode(true);
      const quickRole = PERSONA_ROLES.find((r) => r.id === 'quick-shot');
      if (quickRole) setSelectedRole(quickRole);
    } else {
      setIsQuickShotMode(false);
      setSelectedRole(DEFAULT_ROLE);
    }
  };

  const handleSelectRole = (role: PersonaRole) => {
    setSelectedRole(role);
    if (activeConvId) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConvId ? { ...c, roleId: role.id } : c))
      );
    }
  };

  // Main Send Function
  const sendMessage = async (userPromptText: string) => {
    const textToSend = userPromptText.trim();
    if (!textToSend || isLoading) return;

    setShouldAutoScroll(true);

    // Ensure we have an active conversation
    let currentConv = activeConversation;
    if (!currentConv) {
      currentConv = createNewConversation(
        textToSend.length > 35 ? textToSend.substring(0, 35) + '...' : textToSend
      );
    } else if (currentConv.messages.length === 0) {
      // Auto-title conversation from first prompt
      const generatedTitle =
        textToSend.length > 35 ? textToSend.substring(0, 35) + '...' : textToSend;
      handleRenameConversation(currentConv.id, generatedTitle);
    }

    const convId = currentConv.id;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const assistantMsgId = `msg_a_${Date.now() + 1}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      model: DEFAULT_MODEL,
      roleId: selectedRole.id,
    };

    // Update state with user message and blank assistant message
    const updatedMessages = [...currentConv.messages, userMsg];
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              updatedAt: Date.now(),
              model: DEFAULT_MODEL,
              messages: [...updatedMessages, initialAssistantMsg],
            }
          : c
      )
    );

    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Payload for multi-turn chat: send all messages including userMsg
      const payloadMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: payloadMessages,
          model: DEFAULT_MODEL,
          systemInstruction: selectedRole.systemInstruction,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const rawText = decoder.decode(value, { stream: true });
          const lines = rawText.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.chunk) {
                  accumulated += parsed.chunk;
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === convId
                        ? {
                            ...c,
                            messages: c.messages.map((m) =>
                              m.id === assistantMsgId ? { ...m, content: accumulated } : m
                            ),
                          }
                        : c
                    )
                  );
                } else if (parsed.error) {
                  accumulated += `\n\n⚠️ *Error: ${parsed.error}*`;
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === convId
                        ? {
                            ...c,
                            messages: c.messages.map((m) =>
                              m.id === assistantMsgId ? { ...m, content: accumulated, isError: true } : m
                            ),
                          }
                        : c
                    )
                  );
                }
              } catch {
                // Non-JSON SSE line, ignore
              }
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorNote = `\n\n⚠️ *Connection failed: ${err?.message || 'Could not reach server'}*`;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: (m.content || '') + errorNote,
                          isError: true,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = () => {
    if (!activeConversation || messages.length === 0 || isLoading) return;
    // Find last user message
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    const lastUserPrompt = messages[lastUserIndex].content;
    // Trim conversation up to that user prompt (excluding subsequent messages)
    const trimmed = messages.slice(0, lastUserIndex);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, messages: trimmed } : c
      )
    );

    // Re-send that prompt
    setTimeout(() => {
      sendMessage(lastUserPrompt);
    }, 50);
  };

  const handleInsertStructuredText = (structuredText: string) => {
    sendMessage(
      `Here is structured information for our review and next steps:\n\n${structuredText}`
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Sidebar Drawer */}
      <Sidebar
        conversations={conversations}
        activeId={activeConvId}
        onSelectConversation={(id) => setActiveConvId(id)}
        onNewChat={handleStartNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onTogglePin={handleTogglePin}
        onExportAll={handleExportAll}
        onImportBackup={handleImportBackup}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onOpenFreeModal={() => setIsFreeModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col h-full min-w-0 bg-slate-950">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-full max-w-3xl rounded-full bg-gradient-to-r from-cyan-600/10 via-indigo-600/10 to-violet-600/10 blur-3xl" />

        {/* Navbar without visible model selector */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          selectedRole={selectedRole}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
          onOpenStructureModal={() => setIsStructureModalOpen(true)}
          onOpenFreeModal={() => setIsFreeModalOpen(true)}
          onResetChat={handleStartNewChat}
          hasMessages={messages.length > 0}
        />

        {/* Scrollable Chat Viewport */}
        <div
          ref={chatScrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 md:px-6 py-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
        >
          {messages.length === 0 ? (
            <EmptyState
              onSelectPrompt={sendMessage}
              activeRole={selectedRole}
              onOpenStructureModal={() => setIsStructureModalOpen(true)}
            />
          ) : (
            <div className="mx-auto max-w-4xl space-y-2">
              {messages.map((msg, index) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  isLatestAssistant={
                    index === messages.length - 1 && msg.role === 'assistant'
                  }
                  isStreaming={
                    isLoading &&
                    index === messages.length - 1 &&
                    msg.role === 'assistant'
                  }
                  onRegenerate={handleRegenerate}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => sendMessage(input)}
          isLoading={isLoading}
          onStop={handleStopGeneration}
          isQuickShotMode={isQuickShotMode}
          onToggleQuickShotMode={handleToggleQuickShotMode}
          onOpenStructureModal={() => setIsStructureModalOpen(true)}
          activeRoleName={selectedRole.name}
        />
      </div>

      {/* Modals */}
      <QuickStructureModal
        isOpen={isStructureModalOpen}
        onClose={() => setIsStructureModalOpen(false)}
        onInsertToChat={handleInsertStructuredText}
      />

      <RoleSelectorModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        selectedRole={selectedRole}
        onSelectRole={handleSelectRole}
      />

      <FreeBadgeModal
        isOpen={isFreeModalOpen}
        onClose={() => setIsFreeModalOpen(false)}
      />
    </div>
  );
}
