import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock AppointmentService used inside the component
vi.mock('../../services/AppointmentService', () => ({
  AppointmentService: class {
    async getUserAppointments(userId) {
      return [
        { id: 'a1', name: 'Test User', date_time: '2025-12-23T10:00:00Z' }
      ];
    }
    async deleteAppointment(id) { return true; }
  }
}));

import { AppointmentsList } from '../../components/AppointmentsList';

describe('AppointmentsList', () => {
  test('renders appointments and delete button works (confirm accepted)', async () => {
    // mock confirm to always return true
    const origConfirm = window.confirm;
    window.confirm = () => true;

    await act(async () => {
      render(<AppointmentsList userId="u1" refreshKey={0} />);
    });

    await waitFor(() => expect(screen.getByText('Citas')).toBeInTheDocument());
    expect(screen.getByText('Test User')).toBeInTheDocument();

  const deleteBtn = screen.getByRole('button', { name: /Eliminar/i });
  await act(async () => { await userEvent.click(deleteBtn); });

    // after delete, the appointment should be removed from the list
    await waitFor(() => expect(screen.queryByText('Test User')).not.toBeInTheDocument());

    window.confirm = origConfirm;
  });

  test('delete is cancelled when user dismisses confirm', async () => {
    const origConfirm = window.confirm;
    window.confirm = () => false;

    await act(async () => {
      render(<AppointmentsList userId="u1" refreshKey={0} />);
    });

    await waitFor(() => expect(screen.getByText('Citas')).toBeInTheDocument());
    expect(screen.getByText('Test User')).toBeInTheDocument();

  const deleteBtn = screen.getByRole('button', { name: /Eliminar/i });
  await act(async () => { await userEvent.click(deleteBtn); });

    // appointment should still be present
    expect(screen.getByText('Test User')).toBeInTheDocument();

    window.confirm = origConfirm;
  });

  test('shows empty message when no appointments', async () => {
    // Temporarily override the mocked AppointmentService implementation for this test
    const mod = await import('../../services/AppointmentService');
    const Orig = mod.AppointmentService;
    // spy on prototype
    Orig.prototype.getUserAppointments = async function () { return []; };

    await act(async () => {
      render(<AppointmentsList userId="u-empty" refreshKey={0} />);
    });

    await waitFor(() => expect(screen.getByText('Citas')).toBeInTheDocument());
    expect(screen.getByText('No tienes citas programadas.')).toBeInTheDocument();

    // restore (not strictly necessary in vitest isolated tests, but good hygiene)
    delete Orig.prototype.getUserAppointments;
  });
});
