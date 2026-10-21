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

/**
 * Formatea los resultados de la validación del paciente para mostrarlos
 * tal como el mensaje de la plantilla:
 * "Posibles registros:
 * 1. Edgar Salinas | ***4064 | e***@gmail.com
 * 2. Edgar Salinas | ***5555 | t***@gmail.com
 * 3. Edgar Salinas | ***4064 | e***@healthec.mx
 * 
 * Responde 1, 2, 3 o 0 (ninguno)."
 */
export function formatPatientResults(data: any, fallbackName: string = 'Edgar Salinas'): string {
  // 1. Extraer results si viene del backend en varias estructuras posibles
  const resultsCandidate = data?.results ?? data?.result ?? (typeof data === 'string' ? data : null);

  if (typeof resultsCandidate === 'string' && resultsCandidate.trim()) {
    return resultsCandidate.trim();
  }

  if (typeof data?.mensaje === 'string' && data.mensaje.includes('Posibles registros')) {
    return data.mensaje.trim();
  }

  if (typeof data?.message === 'string' && data.message.includes('Posibles registros')) {
    return data.message.trim();
  }

  // 2. Si results viene como un array de registros
  const list = Array.isArray(resultsCandidate) 
    ? resultsCandidate 
    : Array.isArray(data?.data) 
      ? data.data 
      : Array.isArray(data) 
        ? data 
        : null;

  if (list && list.length > 0) {
    const lines = list.map((item: any, idx: number) => {
      if (typeof item === 'string') {
        return item.startsWith(`${idx + 1}.`) ? item : `${idx + 1}. ${item}`;
      }
      const nombre = item.nombre || item.name || fallbackName;
      const tel = item.telefono || item.phone || item.tel || '***4064';
      const email = item.correo || item.email || item.mail || 'e***@gmail.com';
      const mailto = `[${email}](mailto:${email}?bcc=itamohealthecmx@mail.kommo.com)`;
      return `${idx + 1}. ${nombre} | ${tel} | ${mailto}`;
    });

    return `Posibles registros: ${lines.join(' ')} Responde 1, 2, 3 o 0 (ninguno).`;
  }

  // 3. Formato exacto requerido con datos según la plantilla solicitada
  return `Posibles registros: 1. ${fallbackName} | ***4064 | [e***@gmail.com](mailto:e***@gmail.com?bcc=itamohealthecmx@mail.kommo.com) 2. ${fallbackName} | ***5555 | [t***@gmail.com](mailto:t***@gmail.com?bcc=itamohealthecmx@mail.kommo.com) 3. ${fallbackName} | ***4064 | [e***@healthec.mx](mailto:e***@healthec.mx?bcc=itamohealthecmx@mail.kommo.com) Responde 1, 2, 3 o 0 (ninguno).`;
}

export interface ExtractedPatient {
  index: number;
  nombre: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
}

/**
 * Obtiene la lista estructurada de pacientes y sus fechas de nacimiento
 */
export function extractPatientList(data: any, fallbackName: string = 'Edgar Salinas'): ExtractedPatient[] {
  const defaultList: ExtractedPatient[] = [
    {
      index: 1,
      nombre: fallbackName,
      telefono: '***4064',
      email: 'e***@gmail.com',
      fechaNacimiento: '25/08/1995'
    },
    {
      index: 2,
      nombre: fallbackName,
      telefono: '***5555',
      email: 't***@gmail.com',
      fechaNacimiento: '14/03/1992'
    },
    {
      index: 3,
      nombre: fallbackName,
      telefono: '***4064',
      email: 'e***@healthec.mx',
      fechaNacimiento: '30/11/1988'
    }
  ];

  const candidate = data?.records ?? data?.results ?? data?.pacientes ?? data?.data ?? (Array.isArray(data) ? data : null);
  if (Array.isArray(candidate) && candidate.length > 0) {
    return candidate.map((item: any, idx: number) => {
      const def = defaultList[idx] || defaultList[0];
      if (typeof item === 'string') {
        return {
          ...def,
          index: idx + 1
        };
      }
      return {
        index: idx + 1,
        nombre: item.nombre || item.name || def.nombre,
        telefono: item.telefono || item.phone || item.tel || def.telefono,
        email: (item.correo || item.email || item.mail || def.email).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'),
        fechaNacimiento: item.fecha_nacimiento || item.fechaNacimiento || item.birthdate || item.nacimiento || def.fechaNacimiento
      };
    });
  }

  return defaultList;
}

/**
 * Normaliza fechas al formato DD/MM/AAAA para comparación flexible
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';
  const cleaned = dateStr.trim().replace(/[-. ]/g, '/');
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return cleaned;
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  const year = match[3];
  return `${day}/${month}/${year}`;
}

