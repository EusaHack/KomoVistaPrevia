import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCheck, 
  Clock, 
  Users, 
  Zap, 
  Send, 
  RotateCcw, 
  Sparkles,
  User,
  Bot,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import type { ChatMessage, LeadContact, SenderRole } from '../types';
import { WhatsAppIcon } from './WhatsAppIcon';
import { quickReplies } from '../mockData';

interface ChatFeedProps {
  contact: LeadContact;
  messages: ChatMessage[];
  onSendMessage: (msg: { 
    text: string; 
    role: SenderRole; 
    options?: string[]; 
    senderName?: string;
    timestamp?: string;
  }) => void;
  onResetMessages: () => void;
  onMarkStatus: (status: 'resolved' | 'waiting') => void;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  contact,
  messages,
  onSendMessage,
  onResetMessages,
  onMarkStatus
}) => {
  const [inputText, setInputText] = useState('');
  const [activeRole, setActiveRole] = useState<SenderRole>('user');
  const [autoBotReply, setAutoBotReply] = useState<boolean>(true);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [quickTemplateOpen, setQuickTemplateOpen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // When an option is clicked, it is sent as the client user
    const roleToSend: SenderRole = textToSend ? 'user' : activeRole;

    onSendMessage({
      text: text.trim(),
      role: roleToSend
    });

    if (!textToSend) {
      setInputText('');
    }

    // If role is user and autoBotReply is enabled, simulate SalesBot response
    if (roleToSend === 'user' && autoBotReply) {
      setIsBotTyping(true);
      setTimeout(() => {
        setIsBotTyping(false);
        generateBotResponse(text.trim());
      }, 1000);
    }
  };

  const generateBotResponse = (userQuery: string) => {
    const lower = userQuery.toLowerCase();
    let reply = '';
    let nextOptions: string[] | undefined = undefined;
    let botSender = 'SalesBot (Salesbot #3)';

    if (lower.includes('cita') || lower.includes('agendar')) {
      reply = `🗓️ Perfecto.\n\n¿Qué modalidad prefieres?`;
      nextOptions = [
        '🏥 Presencial',
        '💻 En línea',
        '↩️ Regresar al menú'
      ];
      botSender = 'SalesBot (Salesbot #3)';
    } else if (lower.includes('presencial')) {
      reply = `🏥 Perfecto, seleccionaste atención presencial.\n\nAntes de continuar quisiera saber:\n\n¿Es la primera vez que nos visitas o ya has tenido alguna cita con nosotros anteriormente?`;
      nextOptions = [
        '1️⃣ Es mi primera cita',
        '2️⃣ Ya he tenido una cita anteriormente',
        '3️⃣ Regresar'
      ];
      botSender = 'SalesBot (Salesbot #3)';
    } else if (lower.includes('primera cita') || lower.includes('primera') || lower.includes('1️⃣')) {
      reply = `Perfecto 👏\n\nEntonces será tu primera cita con Healthec.\n\nModalidad seleccionada: Presencial.\n\nPara continuar, ¿cuál es tu nombre completo?\n\nPuedes seleccionar "Regresar" para volver al menú anterior.`;
      nextOptions = [
        '3️⃣ Regresar'
      ];
      botSender = 'SalesBot (Salesbot #3)';
    } else if (lower.includes('anteriormente') || lower.includes('ya he tenido') || lower.includes('2️⃣')) {
      reply = `¡Bienvenido de nuevo a Healthec! 🏥\n\nPara buscar tu expediente, por favor compártenos tu nombre completo o tu número de teléfono registrado:`;
      nextOptions = [
        '3️⃣ Regresar'
      ];
      botSender = 'SalesBot (Salesbot #3)';
    } else if (userQuery.includes('3️⃣') || lower === 'regresar') {
      reply = `🗓️ Perfecto.\n\n¿Qué modalidad prefieres?`;
      nextOptions = [
        '🏥 Presencial',
        '💻 En línea',
        '↩️ Regresar al menú'
      ];
      botSender = 'SalesBot (Salesbot #3)';
    } else if (lower.includes('línea') || lower.includes('linea') || lower.includes('online')) {
      reply = `Perfecto, seleccionaste atención En línea.\n\nTe conectaremos mediante videollamada segura. ¿Para quién es la cita?`;
      nextOptions = [
        'Para mí',
        'Para un familiar / otra persona',
        '↩️ Regresar al menú'
      ];
      botSender = 'SalesBot (Salesbot #3)';
    } else if (lower.includes('precios') || lower.includes('costo')) {
      reply = `Nuestros precios actuales de consulta son:\n\n• Consulta General: $450 MXN\n• Consulta Especialidad: $850 MXN\n• Paquete de Seguimiento: $1,200 MXN\n\n¿Deseas agendar tu cita ahora?`;
      nextOptions = [
        'Agendar una cita',
        'Hablar con un asesor',
        '↩️ Regresar al menú'
      ];
      botSender = 'SalesBot (Salesbot #19)';
    } else if (lower.includes('red') || lower.includes('formar parte')) {
      reply = `¡Nos complace tu interés en formar parte de la red médica Healthec! 🩺\n\nPara iniciar tu proceso de afiliación, por favor compártenos tu especialidad médica y cédula profesional.`;
      nextOptions = [
        'Especialista / Médico General',
        'Clínica / Centro de Salud',
        '↩️ Regresar al menú'
      ];
      botSender = 'SalesBot (Salesbot #19)';
    } else if (lower.includes('ubicacion') || lower.includes('ubicaciones') || lower.includes('donde')) {
      reply = `Contamos con las siguientes ubicaciones para tu atención:\n\n📍 Sede Central: Insurgentes Sur 1450, Col. Actipan, CDMX\n📍 Sede Norte: Plaza Satélite, Torre Médica Piso 4\n\nHorario: Lunes a Sábado de 8:00 AM a 8:00 PM`;
      nextOptions = [
        'Agendar una cita',
        '↩️ Regresar al menú'
      ];
      botSender = 'SalesBot (Salesbot #19)';
    } else if (lower.includes('regresar') || lower.includes('menú') || lower.includes('menu')) {
      reply = `Hola 👋\n\nSoy el asistente virtual de Healthec.\n\n¿Sobre qué deseas información?`;
      nextOptions = [
        'Agendar una cita',
        'Consultar precios',
        'Formar parte de la red Healthec',
        'Consultar ubicaciones'
      ];
      botSender = 'SalesBot (Salesbot #19)';
    } else {
      reply = `Entendido. He recibido tu mensaje: "${userQuery}".\n\nUn asesor de Healthec continuará la atención en breve.`;
      botSender = 'SalesBot (Salesbot #3)';
    }

    onSendMessage({
      text: reply,
      role: 'bot',
      senderName: botSender,
      ...(nextOptions ? { options: nextOptions } : {})
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="kommo-chat-panel">
      {/* Emulation Top Control Banner */}
      <div className="emulator-control-banner">
        <div className="emulator-title-badge">
          <Sparkles size={14} color="#38bdf8" />
          <span>Emulador de Mensajes</span>
        </div>

        <div className="emulator-role-toggles">
          <button 
            className={`role-btn ${activeRole === 'user' ? 'active' : ''}`}
            onClick={() => {
              setActiveRole('user');
              inputRef.current?.focus();
            }}
            title="Enviar como cliente (Eusahack)"
          >
            <User size={13} />
            <span>Cliente</span>
          </button>

          <button 
            className={`role-btn ${activeRole === 'bot' ? 'active' : ''}`}
            onClick={() => {
              setActiveRole('bot');
              inputRef.current?.focus();
            }}
            title="Enviar como SalesBot"
          >
            <Bot size={13} />
            <span>SalesBot</span>
          </button>

          <button 
            className={`role-btn ${activeRole === 'agent' ? 'active' : ''}`}
            onClick={() => {
              setActiveRole('agent');
              inputRef.current?.focus();
            }}
            title="Enviar como asesor Edgar Salinas"
          >
            <UserCheck size={13} />
            <span>Agente</span>
          </button>
        </div>

        <div className="emulator-actions-group">
          <label className="auto-bot-toggle" title="Responder automáticamente como SalesBot tras mensaje del cliente">
            <input 
              type="checkbox" 
              checked={autoBotReply}
              onChange={(e) => setAutoBotReply(e.target.checked)}
            />
            <span>Auto-SalesBot</span>
          </label>

          <button 
            className="reset-chat-btn" 
            onClick={onResetMessages}
            title="Restablecer conversación al estado de la imagen"
          >
            <RotateCcw size={12} style={{ display: 'inline', marginRight: 4 }} />
            Reiniciar
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="messages-scroll-area">
        {messages.map((msg) => {
          if (msg.isHeaderSnippet) {
            return (
              <div key={msg.id} className="header-snippet-bubble">
                <div className="snippet-meta">{msg.timestamp} {msg.senderName}</div>
                <div className="snippet-content">
                  <span role="img" aria-label="doc">📄</span>
                  <span>{msg.content}</span>
                </div>
              </div>
            );
          }

          // User incoming message (Left Side)
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="message-row incoming">
                <div className="chat-avatar-container" style={{ alignSelf: 'flex-start' }}>
                  <img 
                    src={msg.avatarUrl || contact.avatarUrl} 
                    alt={msg.senderName} 
                    className="chat-avatar"
                    style={{ width: '32px', height: '32px' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%231b3552"/><text x="50%" y="55%" fill="%23ffffff" font-size="12" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">E</text></svg>';
                    }}
                  />
                  <div className="whatsapp-badge-icon" style={{ width: '13px', height: '13px', bottom: -2, right: -2 }}>
                    <WhatsAppIcon size={8} color="#ffffff" />
                  </div>
                </div>

                <div className="user-incoming-bubble">
                  {msg.id !== 'msg-1' && (
                    <div className="message-incoming-header">
                      <span>{msg.timestamp} {msg.senderName}</span>
                    </div>
                  )}
                  <div>{msg.content}</div>
                </div>
              </div>
            );
          }

          // Bot message (Right Side, Rich Blue)
          if (msg.sender === 'bot') {
            return (
              <div key={msg.id} className="message-row outgoing">
                <div className="bot-outgoing-bubble">
                  <div className="bot-bubble-meta">
                    <span>{msg.timestamp} {msg.senderName}</span>
                    <span className="read-check-icon">
                      <CheckCheck size={14} color="#7dd3fc" />
                      <span>Leído</span>
                    </span>
                  </div>

                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {msg.content}
                  </div>

                  {/* Selectable Interactive Options */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="bot-options-container">
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          className="bot-option-btn"
                          onClick={() => handleSend(opt)}
                          title={`Seleccionar y responder: "${opt}"`}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {opt}
                          </span>
                          <ChevronRight size={14} className="bot-option-icon" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Robot avatar with WhatsApp badge */}
                  <img 
                    src={msg.avatarUrl || '/salesbot_avatar.jpg'} 
                    alt="SalesBot" 
                    className="bot-avatar-badge"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="%23ffffff"/><circle cx="10" cy="12" r="2" fill="%230284c7"/><circle cx="18" cy="12" r="2" fill="%230284c7"/></svg>';
                    }}
                  />
                  <div className="bot-wa-sub-icon">
                    <WhatsAppIcon size={9} color="#ffffff" />
                  </div>
                </div>
              </div>
            );
          }

          // Human Agent message (Right Side, Dark Blue Slate)
          return (
            <div key={msg.id} className="message-row outgoing">
              <div 
                className="bot-outgoing-bubble" 
                style={{ 
                  background: '#193f66', 
                  borderColor: '#265b91' 
                }}
              >
                <div className="bot-bubble-meta">
                  <span>{msg.timestamp} {msg.senderName}</span>
                  <span className="read-check-icon">
                    <CheckCheck size={14} color="#7dd3fc" />
                    <span>Entregado</span>
                  </span>
                </div>
                <div>{msg.content}</div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isBotTyping && (
          <div className="message-row outgoing">
            <div className="typing-bubble">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}

        {/* Action Buttons Under Message: Marque resuelto, Poner en espera, Conversación Nº A132 */}
        <div className="message-actions-bar">
          <button 
            className="chat-action-btn"
            onClick={() => {
              onMarkStatus('resolved');
              setStatusMessage('Conversación marcada como resuelta');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
          >
            Marque resuelto
          </button>
          <button 
            className="chat-action-btn"
            onClick={() => {
              onMarkStatus('waiting');
              setStatusMessage('Conversación puesta en espera');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
          >
            Poner en espera
          </button>
          <span 
            className="conversation-number-link"
            title="Identificador de conversación WhatsApp"
          >
            Conversación Nº {contact.conversationNumber}
          </span>
        </div>

        {statusMessage && (
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#4ade80', paddingRight: '4px' }}>
            ✓ {statusMessage}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies chips bar */}
      <div className="quick-replies-bar">
        <span style={{ fontSize: '11px', color: '#54708a', alignSelf: 'center', marginRight: '4px' }}>
          Emular clic:
        </span>
        {quickReplies.map((reply, idx) => (
          <button 
            key={idx}
            className="quick-reply-chip"
            onClick={() => handleSend(reply)}
            title={`Enviar "${reply}" como ${activeRole === 'user' ? 'Cliente' : activeRole}`}
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Yellow Task Reminder Bar */}
      <div className="task-reminder-bar">
        <div className="task-reminder-left">
          <Clock size={14} color="#854d0e" />
          <span>No hay tareas.</span>
          <span 
            className="task-link"
            onClick={() => alert('Crear nueva tarea en Kommo')}
          >
            Crear una
          </span>
        </div>

        <div className="task-reminder-right">
          <span>Participantes: 0</span>
          <button className="participants-btn" title="Ver participantes">
            <Users size={14} />
          </button>
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="chat-input-container">
        <div className="chat-input-box">
          <span 
            className="input-target-prefix" 
            title="Chat para Eusahack"
          >
            Chat para {contact.name}:
          </span>

          <button 
            className="quick-template-icon" 
            title="Plantillas rápidas / Bots"
            onClick={() => setQuickTemplateOpen(!quickTemplateOpen)}
          >
            <Zap size={14} />
          </button>

          <input 
            ref={inputRef}
            type="text" 
            className="chat-text-input"
            placeholder={
              activeRole === 'user' 
                ? 'Escribe como Eusahack (Cliente)...' 
                : activeRole === 'bot' 
                  ? 'Escribe como SalesBot...' 
                  : 'Escribe un mensaje o escribe "/" para comandos...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <span className="input-right-tag">
            Conversación Nº {contact.conversationNumber}
          </span>

          <button 
            className="send-action-btn"
            onClick={() => handleSend()}
            title="Enviar mensaje (Enter)"
          >
            <Send size={14} />
          </button>
        </div>

        {/* Quick templates dropdown if clicked */}
        {quickTemplateOpen && (
          <div style={{
            background: '#0e2238',
            border: '1px solid #1f4369',
            borderRadius: '6px',
            marginTop: '8px',
            padding: '8px 12px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
          }}>
            <span style={{ width: '100%', fontSize: '11.5px', color: '#7892a9', marginBottom: '2px' }}>
              Plantillas de bot recomendadas:
            </span>
            {[
              'Perfecto, seleccionaste atención presencial.',
              '¿Cuál es tu horario preferido?',
              'Confirmar recepción de documentos',
              'Transferir con asesor humano'
            ].map((tpl, i) => (
              <button
                key={i}
                className="quick-reply-chip"
                onClick={() => {
                  setInputText(tpl);
                  setQuickTemplateOpen(false);
                }}
              >
                {tpl}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
