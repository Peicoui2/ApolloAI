import { vi } from 'vitest';

// Mock the supabase client exported from main
vi.mock('../../main', () => ({
  supabase: {
    from: () => ({
      insert: () => ({ select: async () => ({ data: [{ id: 'ok' }], error: null }) }),
      select: () => ({ eq: () => ({ order: async () => ({ data: [], error: null }) }) }),
      delete: () => ({ eq: async () => ({ data: [], error: null }) })
    })
  }
}));

import { AppointmentService } from '../../services/AppointmentService';

describe('AppointmentService', () => {
  test('createAppointment returns data', async () => {
    const svc = new AppointmentService();
    const res = await svc.createAppointment({ name: 'A', phone: 'p', dateTime: new Date().toISOString() }, 'u1');
    expect(res).toBeDefined();
  });

  test('getUserAppointments returns array', async () => {
    const svc = new AppointmentService();
    const res = await svc.getUserAppointments('u1');
    expect(Array.isArray(res)).toBe(true);
  });

  test('deleteAppointment returns data', async () => {
    const svc = new AppointmentService();
    const res = await svc.deleteAppointment('id1');
    expect(res).toBeDefined();
  });
});
