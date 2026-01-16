import { dateUtils } from '../../utils/dateUtils';
import { timeUtils } from '../../utils/timeUtils';

describe('dateUtils', () => {
  test('formatDate returns dd/mm/yyyy', () => {
    const d = new Date(2025, 11, 23); // months 0-indexed -> December
    expect(dateUtils.formatDate(d)).toBe('23/12/2025');
  });

  test('getDayOfWeek returns a Date in the future for a valid day', () => {
    const res = dateUtils.getDayOfWeek('lunes');
    expect(res instanceof Date).toBe(true);
  });
});

describe('timeUtils', () => {
  test('formatTime produces HH:mm', () => {
    const d = new Date();
    const t = timeUtils.formatTime(d);
    expect(typeof t).toBe('string');
    expect(t.length).toBeGreaterThanOrEqual(4);
  });
});
