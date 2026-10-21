export const CONFIG = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
  defaultConversationId: import.meta.env.VITE_DEFAULT_CONVERSATION_ID || 'A132',
  defaultLeadId: import.meta.env.VITE_DEFAULT_LEAD_ID || '509436',
  defaultBotName: import.meta.env.VITE_DEFAULT_BOT_NAME || 'SalesBot (Salesbot #19)'
};
