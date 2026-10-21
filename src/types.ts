export type SenderRole = 'user' | 'bot' | 'agent' | 'system';

export interface ChatMessage {
  id: string;
  sender: SenderRole;
  senderName: string;
  avatarUrl?: string;
  timestamp: string;
  content: string;
  status?: 'sent' | 'delivered' | 'read';
  channel?: 'whatsapp' | 'web';
  isHeaderSnippet?: boolean;
  options?: string[];
  selectedOption?: string;
}

export interface LeadContact {
  id: string;
  conversationNumber: string;
  name: string;
  personName: string;
  fullName: string;
  assignedUser: string;
  budget: string;
  pipelineStage: string;
  stageDays: number;
  phone: string;
  email: string;
  company: string;
  role: string;
  subscription: string;
  avatarUrl: string;
  birthDate?: string;
  status: 'active' | 'resolved' | 'waiting';
  channel: 'whatsapp';
}
