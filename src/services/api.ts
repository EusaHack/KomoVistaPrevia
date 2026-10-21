import { CONFIG } from '../config';
import type { ChatMessage, SenderRole } from '../types';

export interface SendMessagePayload {
  conversationId: string;
  leadId: string;
  sender: SenderRole;
  text: string;
  timestamp: string;
}

export interface BackendMessageResponse {
  reply?: string;
  options?: string[];
  senderName?: string;
  timestamp?: string;
}

/**
 * Servicio para conectar el emulador con la API del backend
 */
export const chatApiService = {
  /**
   * Envía un mensaje al backend y espera la respuesta del bot/servidor
   */
  async sendMessage(payload: SendMessagePayload): Promise<BackendMessageResponse | null> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn(`[Backend API] Error status ${response.status} from ${CONFIG.apiUrl}`);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('[Backend API] No se pudo conectar con el backend. Usando simulación local.', error);
      return null;
    }
  },

  /**
   * Obtiene el historial de mensajes de la conversación
   */
  async getMessages(conversationId: string = CONFIG.defaultConversationId): Promise<ChatMessage[] | null> {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/conversations/${conversationId}/messages`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.warn('[Backend API] Fallo al cargar historial remoto, usando mock.', error);
      return null;
    }
  }
};
