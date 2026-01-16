import { formatNameResponse, formatPhoneResponse, formatDateResponse, formatTimeResponse, validateDateAgainstBusiness, validateTimeAgainstBusiness } from '../../utils/userInputFormatters';
import { businessConfig } from '../../config/business.config';

describe('userInputFormatters', () => {
  test('formatNameResponse accepts valid full name', () => {
    expect(formatNameResponse('Juan Perez')).toEqual({ ok: true, value: 'Juan Perez' });
  });

  test('formatNameResponse rejects single name or digits', () => {
    expect(formatNameResponse('Juan')).toEqual({ ok: false, value: null });
    expect(formatNameResponse('J0hn 123')).toEqual({ ok: false, value: null });
  });

  test('formatPhoneResponse accepts correct +34 format', () => {
    expect(formatPhoneResponse('+34 600 123 456')).toEqual({ ok: true, value: '+34 600 123 456' });
  });

  test('formatPhoneResponse rejects invalid formats', () => {
    expect(formatPhoneResponse('600123456')).toEqual({ ok: false, value: null });
  });

  test('formatDateResponse accepts dd/mm/yyyy', () => {
    expect(formatDateResponse('23/12/2025')).toEqual({ ok: true, value: '23/12/2025' });
  });

  test('formatTimeResponse accepts HH:mm', () => {
    expect(formatTimeResponse('18:30')).toEqual({ ok: true, value: '18:30' });
  });

  test('validateDateAgainstBusiness rejects sunday', () => {
    const res = validateDateAgainstBusiness('21/12/2025', businessConfig);
    expect(res.ok).toBe(false);
    expect(typeof res.message).toBe('string');
  });

  test('validateTimeAgainstBusiness rejects outside hours', () => {
    const res = validateTimeAgainstBusiness('23/12/2025', '08:00', businessConfig);
    expect(res.ok).toBe(false);
  });

  test('validateTimeAgainstBusiness accepts within hours', () => {
    const res = validateTimeAgainstBusiness('23/12/2025', '10:00', businessConfig);
    expect(res.ok).toBe(true);
  });
});
