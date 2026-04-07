export interface AiMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface AiAssistantState {
  messages: AiMessage[];
  input: string;
  isTyping: boolean;
  threads: any[];
  currentThreadId: string | null;
}

export interface SuggestionChipProps {
  text: string;
}

export interface RecommendationCardProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  iconBg: string;
}
