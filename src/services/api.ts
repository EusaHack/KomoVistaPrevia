import { CONFIG } from '../config';

export interface ValidarPacientePayload {
  accion: 'validar_paciente';
  nombre: string;
  limit: number;
}

export interface ValidarPacienteResponse {
  ok: boolean;
  status: number;
  data: any;
  raw?: string;
}

/**
 * Servicio para conectar el emulador con la API del backend
 */
export const chatApiService = {
  /**
   * Envía la acción de validar_paciente al endpoint VITE_API_URL
   */
  async validarPaciente(nombre: string, limit: number = 3): Promise<ValidarPacienteResponse> {
    try {
      const payload: ValidarPacientePayload = {
        accion: 'validar_paciente',
        nombre: nombre.trim(),
        limit
      };

      const response = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      return {
        ok: response.ok,
        status: response.status,
        data,
        raw: text
      };
    } catch (error: any) {
      console.warn('[Backend API Error]:', error);
      return {
        ok: false,
        status: 0,
        data: null,
        raw: error?.message || 'Error de conexión con el backend (NetworkError / CORS)'
      };
    }
  }
};
