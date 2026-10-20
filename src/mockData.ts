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
    id: 'msg-0',
    sender: 'bot',
    senderName: 'SalesBot',
    timestamp: '24.09.2026 17:36',
    content: 'Perfecto, seleccionaste atención presencial. Antes de ...',
    isHeaderSnippet: true
  },
  {
    id: 'msg-1',
    sender: 'user',
    senderName: 'Eusahack',
    avatarUrl: '/eusahack_avatar.jpg',
    timestamp: '24.09.2026 17:36',
    content: 'Es mi primera cita',
    channel: 'whatsapp'
  },
  {
    id: 'msg-2',
    sender: 'bot',
    senderName: 'SalesBot (Salesbot #3)',
    avatarUrl: '/salesbot_avatar.jpg',
    timestamp: '24.09.2026 17:36',
    status: 'read',
    content: `Perfecto 👏\n\nEntonces será tu primera cita con Healthec.\n\nModalidad seleccionada: Presencial.\n\nPara continuar, ¿cuál es tu nombre completo?\n\nPuedes seleccionar "Regresar" para volver al menú anterior.`,
    channel: 'whatsapp'
  },
  {
    id: 'msg-3',
    sender: 'user',
    senderName: 'Eusahack',
    avatarUrl: '/eusahack_avatar.jpg',
    timestamp: '24.09.2026 17:37',
    content: 'Edgar Salinas',
    channel: 'whatsapp'
  }
];

export const quickReplies = [
  'Es mi primera cita',
  'Edgar Salinas',
  'Atención Presencial',
  'Consulta General',
  'Confirmar Cita',
  'Regresar'
];
