// Funciones auxiliares para normalizar y validar las respuestas de formateo
// que provienen de ChatGPTService.formatInput (o de cualquier otro origen).

function stripOuterQuotes(s) {
  return s.replace(/^"(.*)"$/, '$1').trim();
}

export function formatNameResponse(raw) {
  if (!raw && raw !== '') return { ok: false, value: null };
  const normalized = stripOuterQuotes(String(raw || '')).trim();
  if (!normalized || normalized.toUpperCase() === 'INVALID') return { ok: false, value: null };
  // extra validation: no digits, at least two words
  if (/\d/.test(normalized)) return { ok: false, value: null };
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { ok: false, value: null };
  return { ok: true, value: normalized };
}

export function formatPhoneResponse(raw) {
  if (!raw && raw !== '') return { ok: false, value: null };
  const normalized = stripOuterQuotes(String(raw || '')).trim();
  if (!normalized || normalized.toUpperCase() === 'INVALID') return { ok: false, value: null };
  const phoneRegex = /^\+34 \d{3} \d{3} \d{3}$/;
  if (!phoneRegex.test(normalized)) return { ok: false, value: null };
  return { ok: true, value: normalized };
}

export function formatDateResponse(raw) {
  if (!raw && raw !== '') return { ok: false, value: null };
  const normalized = stripOuterQuotes(String(raw || '')).trim();
  if (!normalized || normalized.toUpperCase() === 'INVALID') return { ok: false, value: null };
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(normalized)) return { ok: false, value: null };
  return { ok: true, value: normalized };
}

export function formatTimeResponse(raw) {
  if (!raw && raw !== '') return { ok: false, value: null };
  const normalized = stripOuterQuotes(String(raw || '')).trim();
  if (!normalized || normalized.toUpperCase() === 'INVALID') return { ok: false, value: null };
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(normalized)) return { ok: false, value: null };
  return { ok: true, value: normalized };
}

// -- Business hours / scheduling validators
function parseHourToMinutes(hhmm) {
  const [hh, mm] = hhmm.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
}

function parseRange(rangeStr) {
  if (!rangeStr || typeof rangeStr !== 'string') return null;
  const low = rangeStr.trim().toLowerCase();
  if (low.includes('cerr') || low.includes('closed')) return null; // closed
  const m = rangeStr.match(/(\d{1,2}:?\d{0,2})\s*-\s*(\d{1,2}:?\d{0,2})/);
  if (!m) return null;
  const start = m[1].includes(':') ? m[1] : `${m[1]}:00`;
  const end = m[2].includes(':') ? m[2] : `${m[2]}:00`;
  // normalize HH:mm
  const startNorm = start.split(':').map(p => p.padStart(2, '0')).join(':');
  const endNorm = end.split(':').map(p => p.padStart(2, '0')).join(':');
  return { start: startNorm, end: endNorm };
}

// devuelve objeto { ok: boolean, message?: string }
export function validateDateAgainstBusiness(dateStr, businessConfig) {
  // fecha en formato dd/mm/yyyy
  if (!dateStr) return { ok: false, message: 'Fecha inválida.' };
  const [d, m, y] = dateStr.split('/').map(Number);
  const dateObj = new Date(y, m - 1, d);
  if (isNaN(dateObj)) return { ok: false, message: 'Fecha inválida.' };
  const day = dateObj.getDay(); // 0 domingo, 6 sábado

  const hours = businessConfig?.contact?.hours || {};
  // Some configs may have typos; support multiple keys
  const saturdayKey = hours.saturday || hours.samuray || hours.sat;
  const sundayKey = hours.sunday || hours.domingo || hours.sun;

  if (day === 0) {
    // Sunday
    if (!sundayKey) return { ok: false, message: 'Nuestro negocio está cerrado los domingos. Por favor seleccione otro día.' };
    if (String(sundayKey).toLowerCase().includes('cerr')) return { ok: false, message: 'Nuestro negocio está cerrado los domingos. Por favor seleccione otro día.' };
  }
  if (day === 6) {
    // Saturday
    if (!saturdayKey) {
      // If no saturday info, assume closed
      return { ok: false, message: 'Nuestro negocio está cerrado los sábados. Por favor seleccione un día entre semana.' };
    }
    if (String(saturdayKey).toLowerCase().includes('cerr')) return { ok: false, message: 'Nuestro negocio está cerrado los sábados. Por favor seleccione otro día.' };
  }

  // Weekdays assumed OK
  return { ok: true };
}

export function validateTimeAgainstBusiness(dateStr, timeStr, businessConfig) {
  // dateStr: dd/mm/yyyy, timeStr: HH:mm
  if (!dateStr || !timeStr) return { ok: false, message: 'Fecha u hora inválida.' };
  const [d, m, y] = dateStr.split('/').map(Number);
  const dateObj = new Date(y, m - 1, d);
  if (isNaN(dateObj)) return { ok: false, message: 'Fecha inválida.' };
  const day = dateObj.getDay(); // 0 domingo, 6 sábado

  const hours = businessConfig?.contact?.hours || {};
  const weekdaysKey = hours.weekdays || hours.weekday || hours.week;
  const saturdayKey = hours.saturday || hours.samuray || hours.sat;
  const sundayKey = hours.sunday || hours.domingo || hours.sun;

  let rangeStr = null;
  if (day === 0) rangeStr = sundayKey;
  else if (day === 6) rangeStr = saturdayKey;
  else rangeStr = weekdaysKey;

  if (!rangeStr) return { ok: false, message: 'Nuestro negocio está cerrado ese día.' };
  const parsed = parseRange(String(rangeStr));
  if (!parsed) return { ok: false, message: `Nuestro negocio no está disponible en ese día (${rangeStr}). Por favor elija otro día/hora.` };

  const startMin = parseHourToMinutes(parsed.start);
  const endMin = parseHourToMinutes(parsed.end);
  const reqMin = parseHourToMinutes(timeStr);
  if (reqMin === null) return { ok: false, message: 'Hora inválida.' };
  if (reqMin < startMin || reqMin >= endMin) {
    return { ok: false, message: `La hora solicitada está fuera de nuestro horario laboral (${parsed.start} - ${parsed.end}). Por favor elige otra hora dentro del horario laboral.` };
  }
  return { ok: true };
}

export default {
  formatNameResponse,
  formatPhoneResponse,
  formatDateResponse,
  formatTimeResponse
};
