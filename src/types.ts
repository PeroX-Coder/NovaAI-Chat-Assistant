export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
  roleId?: string;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  roleId: string;
  messages: ChatMessage[];
  pinned?: boolean;
}

export interface PersonaRole {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: string;
  systemInstruction: string;
  suggestedPrompts: string[];
  recommendedModel: string;
}

export interface ModelOption {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  speed: 'Instant' | 'Fast' | 'Deep';
  description: string;
  tag: string;
}

export interface QuickToolTemplate {
  id: string;
  title: string;
  description: string;
  category: 'quick-shot' | 'structuring' | 'summary' | 'daily';
  icon: string;
  prompt: string;
  inputPlaceholder?: string;
  mode?: 'table' | 'summary' | 'action_items' | 'simplify' | 'structure';
}
