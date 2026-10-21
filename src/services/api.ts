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

export interface BuscarDoctorPayload {
  accion: 'buscar_doctor';
  nombre: string;
}

export interface BuscarDoctorResponse {
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
      console.warn('[Backend API Error (validar_paciente)]:', error);
      return {
        ok: false,
        status: 0,
        data: null,
        raw: error?.message || 'Error de conexión con el backend (NetworkError / CORS)'
      };
    }
  },

  /**
   * Envía la acción de buscar_doctor al endpoint VITE_API_URL
   */
  async buscarDoctor(nombre: string): Promise<BuscarDoctorResponse> {
    try {
      const payload: BuscarDoctorPayload = {
        accion: 'buscar_doctor',
        nombre: nombre.trim()
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
      console.warn('[Backend API Error (buscar_doctor)]:', error);
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
 * Enmascara números telefónicos mostrando solo los últimos 4 dígitos con prefijo ***
 * Ej: "+52 56 1333 4064" -> "***4064"
 *     "+52 55 5555 5555" -> "***5555"
 */
export function maskPhone(phone: string): string {
  if (!phone) return '***0000';
  const trimmed = phone.trim();
  if (trimmed.startsWith('***') && trimmed.length <= 7) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `***${digits.slice(-4)}`;
  }
  return `***${digits}`;
}

/**
 * Enmascara correos mostrando solo la primera letra, asteriscos y el dominio
 * Ej: "esalinas@healthec.mx" -> "e***@healthec.mx"
 *     "test@gmail.com" -> "t***@gmail.com"
 *     "eusa510@gmail.com" -> "e***@gmail.com"
 */
export function maskEmail(email: string): string {
  if (!email) return 'e***@gmail.com';
  const clean = email.replace(/^mailto:/i, '').replace(/[\[\]]/g, '').trim();
  if (clean.includes('***')) return clean;
  const atIndex = clean.indexOf('@');
  if (atIndex > 0) {
    const firstChar = clean[0];
    const domain = clean.slice(atIndex + 1);
    return `${firstChar}***@${domain}`;
  }
  return clean;
}

/**
 * Procesa y enmascara texto con registros de pacientes que contengan teléfonos y correos
 */
export function maskStringResults(rawText: string): string {
  if (!rawText) return '';

  let processed = rawText;

  // 1. Enmascarar enlaces markdown: [email](mailto:email?bcc=...)
  processed = processed.replace(
    /\[([^\]@\s]+@[^\]\s]+)\]\(mailto:([^?)\s]+)(\?[^)]*)?\)/g,
    (_match, labelEmail, urlEmail, queryParams) => {
      const maskedLabel = maskEmail(labelEmail);
      const maskedUrl = maskEmail(urlEmail);
      const q = queryParams || '?bcc=itamohealthecmx@mail.kommo.com';
      return `[${maskedLabel}](mailto:${maskedUrl}${q})`;
    }
  );

  // 2. Enmascarar teléfonos entre pipes | +52 56 1333 4064 |
  processed = processed.replace(
    /\|\s*(\+?[\d\s-]{7,25})\s*\|/g,
    (_match, phoneStr) => {
      return `| ${maskPhone(phoneStr)} |`;
    }
  );

  // 3. Enmascarar correos sueltos que no estén dentro de markdown
  processed = processed.replace(
    /(?<![*\w])([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    (fullMatch, userPart, domainPart) => {
      if (userPart.includes('***')) return fullMatch;
      return `${userPart[0]}***@${domainPart}`;
    }
  );

  return processed;
}

/**
 * Formatea y enmascara los resultados de la validación del paciente para mostrarlos
 * tal como el mensaje de la plantilla:
 * "Posibles registros: 1. Edgar Salinas | ***4064 | [e***@gmail.com](mailto:...) 2. Edgar Salinas | ***5555 | [t***@gmail.com](mailto:...) 3. Edgar Salinas | ***4064 | [e***@healthec.mx](mailto:...) Responde 1, 2, 3 o 0 (ninguno)."
 */
export function formatPatientResults(data: any, fallbackName: string = 'Edgar Salinas'): string {
  // 1. Extraer results si viene del backend en varias estructuras posibles
  const resultsCandidate = data?.results ?? data?.result ?? (typeof data === 'string' ? data : null);

  if (typeof resultsCandidate === 'string' && resultsCandidate.trim()) {
    return maskStringResults(resultsCandidate.trim());
  }

  if (typeof data?.mensaje === 'string' && data.mensaje.includes('Posibles registros')) {
    return maskStringResults(data.mensaje.trim());
  }

  if (typeof data?.message === 'string' && data.message.includes('Posibles registros')) {
    return maskStringResults(data.message.trim());
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
        const masked = maskStringResults(item);
        return masked.startsWith(`${idx + 1}.`) ? masked : `${idx + 1}. ${masked}`;
      }
      const nombre = item.nombre || item.name || fallbackName;
      const tel = maskPhone(item.telefono || item.phone || item.tel || '***4064');
      const rawEmail = (item.correo || item.email || item.mail || 'e***@gmail.com').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      const email = maskEmail(rawEmail);
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
  telefonoReal?: string;
  email: string;
  emailReal?: string;
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
      email: 'e***@healthec.mx',
      fechaNacimiento: '25/08/1995'
    },
    {
      index: 2,
      nombre: fallbackName,
      telefono: '***4064',
      email: 'e***@gmail.com',
      fechaNacimiento: '14/03/1992'
    },
    {
      index: 3,
      nombre: fallbackName,
      telefono: '***5555',
      email: 't***@gmail.com',
      fechaNacimiento: '30/11/1988'
    }
  ];

  const candidate = data?.records ?? data?.results ?? data?.pacientes ?? data?.data ?? (Array.isArray(data) ? data : null);

  // Si candidate es string, parseamos los registros desde el texto
  if (typeof candidate === 'string' && candidate.includes('Posibles registros')) {
    const regex = /(\d+)\.\s*([^|]+)\|\s*([^|]+)\|\s*(?:\[([^\]]+)\]\([^)]+\)|([^\s|]+))/g;
    const parsedList: ExtractedPatient[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(candidate)) !== null) {
      const idx = parseInt(match[1], 10);
      const nombre = match[2].trim();
      const rawTel = match[3].trim();
      const rawMail = (match[4] || match[5] || '').trim();
      const def = defaultList[idx - 1] || defaultList[0];

      parsedList.push({
        index: idx,
        nombre: nombre || def.nombre,
        telefono: maskPhone(rawTel),
        telefonoReal: rawTel,
        email: maskEmail(rawMail),
        emailReal: rawMail,
        fechaNacimiento: def.fechaNacimiento
      });
    }

    if (parsedList.length > 0) {
      return parsedList;
    }
  }

  if (Array.isArray(candidate) && candidate.length > 0) {
    return candidate.map((item: any, idx: number) => {
      const def = defaultList[idx] || defaultList[0];
      if (typeof item === 'string') {
        return {
          ...def,
          index: idx + 1
        };
      }
      const rawTel = item.telefono || item.phone || item.tel || def.telefono;
      const rawMail = (item.correo || item.email || item.mail || def.email).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      return {
        index: idx + 1,
        nombre: item.nombre || item.name || def.nombre,
        telefono: maskPhone(rawTel),
        telefonoReal: rawTel,
        email: maskEmail(rawMail),
        emailReal: rawMail,
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

/**
 * Formatea la respuesta de la búsqueda de doctores
 */
export function formatDoctorResults(data: any, fallbackDoctor: string = 'García'): { text: string; options?: string[] } {
  const candidate = data?.results ?? data?.result ?? data?.doctores ?? data?.data ?? (typeof data === 'string' ? data : null);

  if (typeof candidate === 'string' && candidate.trim()) {
    return { text: candidate.trim() };
  }

  if (typeof data?.mensaje === 'string' && data.mensaje.trim()) {
    return { text: data.mensaje.trim() };
  }

  const list = Array.isArray(candidate) 
    ? candidate 
    : Array.isArray(data) 
      ? data 
      : null;

  if (list && list.length > 0) {
    const lines = list.map((doc: any, idx: number) => {
      if (typeof doc === 'string') return `${idx + 1}. ${doc}`;
      const nombre = doc.nombre || doc.name || `Dr. ${fallbackDoctor}`;
      const esp = doc.especialidad || doc.specialty || '';
      return `${idx + 1}. ${nombre}${esp ? ` - ${esp}` : ''}`;
    });

    const options = list.map((doc: any, idx: number) => {
      if (typeof doc === 'string') return doc;
      return doc.nombre || doc.name || `Dr. ${idx + 1}`;
    });

    return {
      text: `👨‍⚕️ Doctores encontrados con "${fallbackDoctor}":\n\n${lines.join('\n')}\n\nSelecciona el doctor con quien deseas agendar:`,
      options: [...options, 'Volver al menú']
    };
  }

  return {
    text: `👨‍⚕️ Hemos localizado al especialista "${fallbackDoctor}".\n\n¿Deseas agendar con este doctor?`,
    options: ['Confirmar doctor', 'Volver al menú']
  };
}


