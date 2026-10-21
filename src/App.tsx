import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { LeadDetailsPanel } from './components/LeadDetailsPanel';
import { ChatFeed } from './components/ChatFeed';
import { initialContact, initialMessages } from './mockData';
import type { ChatMessage, LeadContact, SenderRole } from './types';

export function App() {
  const [contact, setContact] = useState<LeadContact>(initialContact);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [detailsCollapsed, setDetailsCollapsed] = useState<boolean>(false);

  // Helper to format date & time like "24.09.2026 17:38"
  const getFormattedTimestamp = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = now.getFullYear();
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const handleSendMessage = ({ 
    text, 
    role, 
    options,
    senderName: customSenderName,
    timestamp: customTimestamp
  }: { 
    text: string; 
    role: SenderRole; 
    options?: string[]; 
    senderName?: string;
    timestamp?: string;
  }) => {
    const timestamp = customTimestamp || getFormattedTimestamp();
    
    let senderName = contact.name;
    let avatarUrl: string | undefined = contact.avatarUrl;

    if (role === 'bot') {
      senderName = customSenderName || 'SalesBot (Salesbot #3)';
      avatarUrl = '/salesbot_avatar.jpg';
    } else if (role === 'agent') {
      senderName = customSenderName || contact.assignedUser;
      avatarUrl = undefined;
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: role,
      senderName,
      ...(avatarUrl ? { avatarUrl } : {}),
      timestamp,
      content: text,
      ...(options && options.length > 0 ? { options } : {}),
      status: role === 'bot' ? 'read' : 'sent',
      channel: 'whatsapp'
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const handleResetMessages = () => {
    setMessages(initialMessages);
    setContact(initialContact);
  };

  const handleMarkStatus = (status: 'resolved' | 'waiting') => {
    setContact((prev) => ({
      ...prev,
      status
    }));
  };

  const handleUpdateContact = (updated: Partial<LeadContact>) => {
    setContact((prev) => ({
      ...prev,
      ...updated
    }));
  };

  // Find last user/bot message for the sidebar preview
  const lastNonHeaderMessage = [...messages].reverse().find((m) => !m.isHeaderSnippet);

  return (
    <div className="kommo-layout">
      {/* Column 1: Chats abiertos */}
      <Sidebar 
        contact={contact} 
        lastMessage={lastNonHeaderMessage}
        onNewChat={() => alert('Nueva conversación de WhatsApp simulada')}
      />

      {/* Column 2: Lead / Contact Details */}
      <LeadDetailsPanel 
        contact={contact} 
        collapsed={detailsCollapsed}
        onToggleCollapse={() => setDetailsCollapsed(!detailsCollapsed)}
        onUpdateContact={handleUpdateContact}
      />

      {/* Column 3: Chat Stream & Message Emulator */}
      <ChatFeed 
        contact={contact}
        messages={messages}
        onSendMessage={handleSendMessage}
        onResetMessages={handleResetMessages}
        onMarkStatus={handleMarkStatus}
        onUpdateContact={handleUpdateContact}
      />
    </div>
  );
}

export default App;
