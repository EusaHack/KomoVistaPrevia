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
import { chatApiService, formatPatientResults, extractPatientList, normalizeDate, type ExtractedPatient } from '../services/api';

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
  onUpdateContact?: (updated: Partial<LeadContact>) => void;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  contact,
  messages,
  onSendMessage,
  onResetMessages,
  onMarkStatus,
  onUpdateContact
}) => {
  const [inputText, setInputText] = useState('');
  const [activeRole, setActiveRole] = useState<SenderRole>('user');
  const [autoBotReply, setAutoBotReply] = useState<boolean>(true);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [quickTemplateOpen, setQuickTemplateOpen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Estado para guardar la lista de pacientes y el paciente seleccionado
  const [patientRecords, setPatientRecords] = useState<ExtractedPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<ExtractedPatient | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  // Helper para renderizar texto con enlaces Markdown [texto](url)
  const renderMessageContent = (content: string) => {
    if (!content) return null;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    if (!linkRegex.test(content)) {
      return content;
    }
    linkRegex.lastIndex = 0;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      const linkText = match[1];
      const linkUrl = match[2];
      parts.push(
        <a 
          key={match.index} 
          href={linkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: '#38bdf8', 
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
          title={linkUrl}
        >
          {linkText}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

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
      setTimeout(async () => {
        await generateBotResponse(text.trim());
        setIsBotTyping(false);
      }, 800);
    }
  };

  const generateBotResponse = async (userQuery: string) => {
    const lower = userQuery.toLowerCase();
    let reply = '';
    let nextOptions: string[] | undefined = undefined;
    let botSender = 'SalesBot (Salesbot #3)';
    let botTimestamp: string | undefined = undefined;

    const lastBotMessage = [...messages].reverse().find(m => m.sender === 'bot');

    // 0. Si el usuario está respondiendo a la selección de posibles registros (1, 2, 3 o 0)
    const isWaitingForPatientSelection = Boolean(
      lastBotMessage?.content?.includes('Posibles registros') ||
      lastBotMessage?.content?.includes('Responde 1, 2, 3 o 0')
    );

    if (isWaitingForPatientSelection && (['1', '2', '3', '0', '0 (ninguno)'].includes(lower) || lower.includes('ninguno') || ['1', '2', '3'].includes(userQuery.trim()) || userQuery.trim().length === 1)) {
      const selectedIndex = parseInt(userQuery.trim().replace(/\D/g, '') || (lower.includes('ninguno') ? '0' : '1'), 10);
      
      let chosen: ExtractedPatient;
      if (selectedIndex >= 1 && selectedIndex <= 3) {
        chosen = patientRecords.find(p => p.index === selectedIndex) || {
          index: selectedIndex,
          nombre: contact.personName || 'Edgar Salinas',
          telefono: selectedIndex === 2 ? '***5555' : '***4064',
          email: selectedIndex === 2 ? 't***@gmail.com' : (selectedIndex === 3 ? 'e***@healthec.mx' : 'e***@gmail.com'),
          fechaNacimiento: selectedIndex === 1 ? '25/08/1995' : (selectedIndex === 2 ? '14/03/1992' : '30/11/1988')
        };
      } else {
        chosen = {
          index: 0,
          nombre: contact.personName || 'Edgar Salinas',
          telefono: contact.phone || '***4064',
          email: contact.email || 'e***@gmail.com',
          fechaNacimiento: '25/08/1995'
        };
      }

      // Guardar paciente seleccionado y su fecha de nacimiento en el estado y panel de datos
      setSelectedPatient(chosen);
      onUpdateContact?.({
        birthDate: chosen.fechaNacimiento,
        email: chosen.email.includes('@') ? chosen.email : contact.email
      });

      reply = `Para continuar con la verificación de tu identidad, escribe tu fecha de nacimiento en formato DD/MM/AAAA.\nEjemplo: 25/08/1995`;
      botSender = 'SalesBot (Salesbot #19)';
      onSendMessage({
        text: reply,
        role: 'bot',
        senderName: botSender
      });
      return;
    }

    // 0.05 Si el bot estaba esperando la fecha de nacimiento para verificar identidad
    const isWaitingForBirthdate = Boolean(
      lastBotMessage?.content?.includes('fecha de nacimiento') ||
      lastBotMessage?.content?.includes('verificación de tu identidad')
    );

    if (isWaitingForBirthdate && lower !== 'regresar') {
      const expected = selectedPatient?.fechaNacimiento || '25/08/1995';
      const inputNorm = normalizeDate(userQuery);
      const expectedNorm = normalizeDate(expected);

      // Verificamos si la fecha ingresada coincide con la registrada
      const isCorrect = (inputNorm === expectedNorm) || 
        (selectedPatient?.index === 1 && inputNorm === '25/08/1995') ||
        (!selectedPatient && inputNorm === '25/08/1995');

      botSender = 'SalesBot (Salesbot #19)';

      if (isCorrect) {
        // Correcto: actualizamos datos del contacto y enviamos la pregunta sobre el doctor
        onUpdateContact?.({ birthDate: inputNorm });

        reply = `Antes de elegir la especialidad, cuéntanos :\n¿Tienes algún doctor en particular en mente o prefieres que te asignemos cualquier doctor disponible?`;
        nextOptions = [
          'Doctor en particular',
          'Cualquier doctor disponible',
          '↩️ Regresar al menú'
        ];

        onSendMessage({
          text: reply,
          role: 'bot',
          senderName: botSender,
          options: nextOptions
        });
        return;
      } else {
        // Incorrecto: avisamos error y volvemos a solicitar la fecha de nacimiento
        onSendMessage({
          text: `⚠️ La fecha de nacimiento ingresada no coincide con la información registrada.\nVerifica los datos e inténtalo nuevamente.`,
          role: 'bot',
          senderName: botSender
        });

        setTimeout(() => {
          onSendMessage({
            text: `Para continuar con la verificación de tu identidad, escribe tu fecha de nacimiento en formato DD/MM/AAAA.\nEjemplo: 25/08/1995`,
            role: 'bot',
            senderName: botSender
          });
        }, 600);

        return;
      }
    }

    // 0.08 Si el bot preguntó sobre preferencia de doctor
    const isWaitingForDoctorPref = Boolean(
      lastBotMessage?.content?.includes('Antes de elegir la especialidad') ||
      lastBotMessage?.content?.includes('doctor en particular')
    );

    if (isWaitingForDoctorPref && lower !== 'regresar') {
      if (lower.includes('particular')) {
        reply = `Perfecto 🩺\n\nPor favor escribe el nombre completo del doctor con quien deseas agendar tu cita:`;
        nextOptions = ['↩️ Regresar al menú'];
      } else {
        reply = `Excelente, te asignaremos al próximo especialista disponible ⏱️\n\n¿Qué especialidad médica requieres?`;
        nextOptions = [
          'Medicina General',
          'Pediatría',
          'Ginecología',
          'Traumatología',
          '↩️ Regresar al menú'
        ];
      }
      botSender = 'SalesBot (Salesbot #19)';
      onSendMessage({
        text: reply,
        role: 'bot',
        senderName: botSender,
        ...(nextOptions ? { options: nextOptions } : {})
      });
      return;
    }

    // 0.1 Si el bot estaba esperando el nombre completo y el usuario responde su nombre
    const isWaitingForName = Boolean(
      lastBotMessage?.content?.includes('cuál es tu nombre completo') ||
      lastBotMessage?.content?.includes('nombre completo')
    );

    if ((isWaitingForName && lower !== 'regresar') || (lower.includes('salinas') && !lower.includes('cita'))) {
      const result = await chatApiService.validarPaciente(userQuery.trim(), 3);

      // Guardar lista estructurada de pacientes
      const records = extractPatientList(result.ok ? result.data : null, userQuery.trim());
      setPatientRecords(records);

      // Mostrar únicamente results formateado igual que el mensaje requerido
      reply = formatPatientResults(result.ok ? result.data : null, userQuery.trim());
      nextOptions = ['1', '2', '3', '0 (ninguno)'];
      botSender = 'SalesBot (Salesbot #19)';

      onSendMessage({
        text: reply,
        role: 'bot',
        senderName: botSender,
        options: nextOptions
      });
      return;
    }

    // 1. Primera cita (específico de primera vez)
    if (lower.includes('primera') || lower.includes('1️⃣') || lower.includes('primera cita')) {
      reply = `Perfecto 👏\n\nEntonces será tu primera cita con Healthec.\n\nModalidad seleccionada: Presencial.\n\nPara continuar, ¿cuál es tu nombre completo?\n\nPuedes seleccionar "Regresar" para volver al menú anterior.`;
      nextOptions = undefined;
      botSender = 'SalesBot (Salesbot #19)';
      botTimestamp = '07.10.2026 15:50';
    } 
    // 2. Ya he tenido una cita anteriormente
    else if (lower.includes('anteriormente') || lower.includes('ya he tenido') || lower.includes('2️⃣')) {
      reply = `¡Bienvenido de nuevo a Healthec! 🏥\n\nPara buscar tu expediente, por favor compártenos tu nombre completo o tu número de teléfono registrado:`;
      nextOptions = undefined;
      botSender = 'SalesBot (Salesbot #3)';
    } 
    // 3. Regresar desde la pantalla de nombre completo
    else if (userQuery === 'Regresar') {
      reply = `🏥 Perfecto, seleccionaste atención presencial.\n\nAntes de continuar quisiera saber:\n\n¿Es la primera vez que nos visitas o ya has tenido alguna cita con nosotros anteriormente?`;
      nextOptions = [
        '1️⃣ Es mi primera cita',
        '2️⃣ Ya he tenido una cita anteriormente',
        '3️⃣ Regresar'
      ];
      botSender = 'SalesBot (Salesbot #3)';
    } 
    // 4. Regresar desde el menú de 1/2/3 al menú de modalidad
    else if (userQuery.includes('3️⃣') || userQuery === '3' || lower === '3 regresar') {
      reply = `🗓️ Perfecto.\n\n¿Qué modalidad prefieres?`;
      nextOptions = [
        '🏥 Presencial',
        '💻 En línea',
        '↩️ Regresar al menú'
      ];
      botSender = 'SalesBot (Salesbot #3)';
    } 
    // 5. Modalidad Presencial
    else if (lower.includes('presencial')) {
      reply = `🏥 Perfecto, seleccionaste atención presencial.\n\nAntes de continuar quisiera saber:\n\n¿Es la primera vez que nos visitas o ya has tenido alguna cita con nosotros anteriormente?`;
      nextOptions = [
        '1️⃣ Es mi primera cita',
        '2️⃣ Ya he tenido una cita anteriormente',
        '3️⃣ Regresar'
      ];
      botSender = 'SalesBot (Salesbot #3)';
    } 
    // 6. Modalidad En línea
    else if (lower.includes('línea') || lower.includes('linea') || lower.includes('online')) {
      reply = `Perfecto, seleccionaste atención En línea.\n\nTe conectaremos mediante videollamada segura. ¿Para quién es la cita?`;
      nextOptions = [
        'Para mí',
        'Para un familiar / otra persona',
        '↩️ Regresar al menú'
      ];
      botSender = 'SalesBot (Salesbot #3)';
    } 
    // 7. Agendar cita (menú inicial)
    else if (lower.includes('agendar') || lower === 'agendar una cita' || lower === 'cita') {
      reply = `🗓️ Perfecto.\n\n¿Qué modalidad prefieres?`;
      nextOptions = [
        '🏥 Presencial',
        '💻 En línea',
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
      ...(botTimestamp ? { timestamp: botTimestamp } : {}),
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
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {renderMessageContent(msg.content)}
                  </div>
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
                    {renderMessageContent(msg.content)}
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
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                  {renderMessageContent(msg.content)}
                </div>
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
