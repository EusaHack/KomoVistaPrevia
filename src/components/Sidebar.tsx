import React, { useState } from 'react';
import { Search, MoreHorizontal } from 'lucide-react';
import type { LeadContact, ChatMessage } from '../types';
import { WhatsAppIcon } from './WhatsAppIcon';

interface SidebarProps {
  contact: LeadContact;
  lastMessage?: ChatMessage;
  onSelectChat?: (id: string) => void;
  onNewChat?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  contact, 
  lastMessage,
  onNewChat 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <aside className="kommo-sidebar">
      {/* Search Bar */}
      <div className="sidebar-search-bar">
        <div className="search-input-wrap">
          <Search size={15} color="#54708a" />
          <input 
            type="text" 
            placeholder="Buscar" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Row: Chats abiertos & Total: 1 */}
      <div className="sidebar-filter-row">
        <div className="filter-pill">
          Chats abiertos
        </div>
        <div className="filter-count-wrap">
          <span>Total: 1</span>
          <button className="more-dots-btn" title="Opciones" onClick={onNewChat}>
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="chat-list">
        <div className="chat-item active">
          {/* Avatar with WhatsApp Badge */}
          <div className="chat-avatar-container">
            <img 
              src={contact.avatarUrl} 
              alt={contact.name} 
              className="chat-avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%231b3552"/><text x="50%" y="55%" fill="%23ffffff" font-size="16" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">E</text></svg>';
              }}
            />
            <div className="whatsapp-badge-icon" title="WhatsApp Business">
              <WhatsAppIcon size={10} color="#ffffff" />
            </div>
          </div>

          {/* Details */}
          <div className="chat-item-content">
            <div className="chat-item-header">
              <div className="chat-item-name-group">
                <span className="chat-item-name">{contact.name}</span>
                <span className="chat-item-badge">{contact.conversationNumber}</span>
              </div>
              <span className="chat-item-time">
                {lastMessage?.timestamp || '07.10.2026 15:49'}
              </span>
            </div>

            <div className="chat-item-subtitle">
              {contact.personName}
            </div>

            <div className="chat-item-snippet">
              {lastMessage?.content || contact.fullName}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
