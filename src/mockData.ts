import type { ChatMessage, LeadContact } from './types';

export const initialContact: LeadContact = {
  id: '#509436',
  conversationNumber: 'A132',
  name: 'Eusahack',
  personName: 'Edgar',
  fullName: 'Edgar Salinas',
  assignedUser: 'Edgar Salinas',
  budget: '$0',
  pipelineStage: 'Negociación',
  stageDays: 26,
  phone: '+5215613334064',
  email: '',
  company: '',
  role: '',
  subscription: '',
  avatarUrl: '/eusahack_avatar.jpg',
  status: 'active',
  channel: 'whatsapp'
};

export const initialMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'bot',
    senderName: 'SalesBot (Salesbot #19)',
    avatarUrl: '/salesbot_avatar.jpg',
    timestamp: '07.10.2026 15:49',
    status: 'read',
    content: `Hola 👋\n\nSoy el asistente virtual de Healthec.\n\n¿Sobre qué deseas información?`,
    options: [
      'Agendar una cita',
      'Consultar precios',
      'Formar parte de la red Healthec',
      'Consultar ubicaciones'
    ],
    channel: 'whatsapp'
  }
];

export const quickReplies = [
  'Agendar una cita',
  'Consultar precios',
  'Formar parte de la red Healthec',
  'Consultar ubicaciones'
];
