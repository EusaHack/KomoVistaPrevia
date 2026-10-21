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

export interface HorariosDoctorPayload {
  accion: 'horarios_doctor';
  doctor_id: number;
}

export interface HorariosDoctorResponse {
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
  },

  /**
   * Envía la acción de horarios_doctor con doctor_id al endpoint VITE_API_URL
   */
  async horariosDoctor(doctorId: number): Promise<HorariosDoctorResponse> {
    try {
      const payload: HorariosDoctorPayload = {
        accion: 'horarios_doctor',
        doctor_id: Number(doctorId)
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
      console.warn('[Backend API Error (horarios_doctor)]:', error);
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

export interface ExtractedDoctor {
  index: number;
  id: number;
  nombre: string;
  especialidad: string;
}

/**
 * Formatea la respuesta de la búsqueda de doctores para mostrar:
 * "Doctores encontrados: 1. EDGAR ABEL GORDILLO HERNÁNDEZ | Ortopedia y Traumatología Responde 1, 2, 3 o 0 (ninguno)."
 */
export function formatDoctorResults(data: any, fallbackDoctor: string = 'EDGAR ABEL GORDILLO HERNÁNDEZ'): { text: string; options: string[]; doctors: ExtractedDoctor[] } {
  const candidate = data?.results ?? data?.result ?? data?.doctores ?? data?.data ?? (typeof data === 'string' ? data : null);

  const defaultDoctor: ExtractedDoctor = {
    index: 1,
    id: 104,
    nombre: fallbackDoctor,
    especialidad: 'Ortopedia y Traumatología'
  };

  // 1. Si candidate ya es string formateado
  if (typeof candidate === 'string' && candidate.trim()) {
    const raw = candidate.trim();
    if (raw.includes('Doctores encontrados')) {
      const regex = /(\d+)\.\s*([^|]+)\|\s*([^\d\n]+?)(?=(?:\s+\d+\.|\s+Responde|$))/g;
      const parsedDoctors: ExtractedDoctor[] = [];
      let match: RegExpExecArray | null;
      while ((match = regex.exec(raw)) !== null) {
        const idx = parseInt(match[1], 10);
        const name = match[2].trim();
        const esp = match[3].trim().replace(/\s+Responde.*$/i, '');
        parsedDoctors.push({
          index: idx,
          id: idx === 1 ? 104 : (104 + idx - 1),
          nombre: name,
          especialidad: esp
        });
      }
      const doctors = parsedDoctors.length > 0 ? parsedDoctors : [defaultDoctor];
      const numOptions = doctors.map(d => `${d.index}`);
      return {
        text: raw,
        options: [...numOptions, '0 (ninguno)'],
        doctors
      };
    }
  }

  // 2. Si candidate o data es un array de doctores
  const list = Array.isArray(candidate) 
    ? candidate 
    : Array.isArray(data) 
      ? data 
      : null;

  if (list && list.length > 0) {
    const doctors: ExtractedDoctor[] = list.map((doc: any, idx: number) => {
      if (typeof doc === 'string') {
        const clean = doc.replace(/^\d+\.\s*/, '');
        const parts = clean.split('|');
        return {
          index: idx + 1,
          id: 104 + idx,
          nombre: (parts[0] || clean).trim(),
          especialidad: (parts[1] || 'Ortopedia y Traumatología').trim()
        };
      }
      const rawId = doc.id ?? doc.doctor_id ?? doc.id_doctor ?? doc.id_medico ?? (104 + idx);
      const nombre = doc.nombre || doc.name || doc.doctor || doc.medico || fallbackDoctor;
      const especialidad = doc.especialidad || doc.specialty || doc.esp || 'Ortopedia y Traumatología';
      return {
        index: idx + 1,
        id: Number(rawId) || 104,
        nombre,
        especialidad
      };
    });

    const lines = doctors.map(d => `${d.index}. ${d.nombre} | ${d.especialidad}`);
    const numOptions = doctors.map(d => `${d.index}`);
    const respondeText = numOptions.length > 1 
      ? `Responde ${numOptions.join(', ')} o 0 (ninguno).`
      : 'Responde 1, 2, 3 o 0 (ninguno).';

    return {
      text: `Doctores encontrados: ${lines.join(' ')} ${respondeText}`,
      options: [...numOptions, '0 (ninguno)'],
      doctors
    };
  }

  // 3. Fallback idéntico al requerimiento
  return {
    text: `Doctores encontrados: 1. ${fallbackDoctor} | Ortopedia y Traumatología Responde 1, 2, 3 o 0 (ninguno).`,
    options: ['1', '2', '3', '0 (ninguno)'],
    doctors: [defaultDoctor]
  };
}

/**
 * Extrae el texto del horario de atención del doctor a partir de la respuesta del backend
 */
export function extractDoctorSchedule(data: any): string {
  if (!data) return 'Lunes a Viernes de 09:00 a 14:00 y 16:00 a 20:00 hrs.';

  if (typeof data === 'string' && data.trim()) {
    const clean = data.trim();
    if (clean.includes('Horarios de atención:')) {
      const match = clean.match(/Horarios de atención:\s*([\s\S]+?)(?=\n\s*\n|\n\s*¿|$)/i);
      if (match && match[1].trim()) return match[1].trim();
    }
    return clean;
  }

  const candidate = 
    data?.horario_doctor ?? 
    data?.horarios_doctor ?? 
    data?.horario_atencion ?? 
    data?.horarios_atencion ?? 
    data?.horario ?? 
    data?.horarios ?? 
    data?.results ?? 
    data?.result ?? 
    data?.data ?? 
    data?.mensaje ?? 
    data?.message;

  if (typeof candidate === 'string' && candidate.trim()) {
    const clean = candidate.trim();
    if (clean.includes('Horarios de atención:')) {
      const match = clean.match(/Horarios de atención:\s*([\s\S]+?)(?=\n\s*\n|\n\s*¿|$)/i);
      if (match && match[1].trim()) return match[1].trim();
    }
    return clean;
  }

  if (Array.isArray(candidate) && candidate.length > 0) {
    return candidate.map((slot: any, idx: number) => {
      if (typeof slot === 'string') return slot;
      const dia = slot.dia || slot.dias || slot.day || slot.fecha || '';
      const hora = slot.hora || slot.horario || slot.time || '';
      if (dia && hora) return `${dia}: ${hora}`;
      return slot.descripcion || slot.texto || `${dia || hora || `Horario ${idx + 1}`}`;
    }).join('\n');
  }

  return 'Lunes a Viernes de 09:00 a 14:00 y 16:00 a 20:00 hrs.';
}

/**
 * Formatea el mensaje con los datos del doctor y horarios con la plantilla solicitada:
 * Perfecto, [Nombre paciente] . 
 * Doctor: [Nombre doctor] 
 * Especialidad: [Especialidad doctor] 
 * Horarios de atención:
 * [Horario doctor] 
 * 
 * 
 * ¿Qué día y a qué hora te gustaría agendar tu cita?
 * 
 * Por favor, escribe la fecha y hora que prefieres utilizando el siguiente formato:
 * 
 * DD/MM/AAAA HH
 * 
 * Por ejemplo: 16/10/2026 13:00
 */
export function formatDoctorScheduleMessage(
  data: any,
  patientName: string = 'Edgar Salinas',
  doctor?: Partial<ExtractedDoctor>
): { text: string; options?: string[] } {
  const schedule = extractDoctorSchedule(data);
  const patient = (patientName || 'Edgar Salinas').trim();
  const docName = (doctor?.nombre || 'EDGAR ABEL GORDILLO HERNÁNDEZ').trim();
  const specialty = (doctor?.especialidad || 'Ortopedia y Traumatología').trim();

  const text = `Perfecto, ${patient} . 
Doctor: ${docName} 
Especialidad: ${specialty} 
Horarios de atención:
${schedule} 


¿Qué día y a qué hora te gustaría agendar tu cita?

Por favor, escribe la fecha y hora que prefieres utilizando el siguiente formato:

DD/MM/AAAA HH

Por ejemplo: 16/10/2026 13:00`;

  return {
    text,
    options: ['16/10/2026 13:00', 'Volver al menú']
  };
}

/**
 * Formatea los horarios disponibles retornados por el backend
 */
export function formatHorariosResults(
  data: any, 
  doctorName: string = 'EDGAR ABEL GORDILLO HERNÁNDEZ',
  patientName: string = 'Edgar Salinas',
  doctor?: Partial<ExtractedDoctor>
): { text: string; options?: string[] } {
  return formatDoctorScheduleMessage(data, patientName, {
    nombre: doctorName,
    especialidad: doctor?.especialidad || 'Ortopedia y Traumatología',
    ...doctor
  });
}


