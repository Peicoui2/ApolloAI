import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

vi.mock('../../services/ChatGPTService', () => {
  return {
    ChatGPTService: class {
      constructor() {
        this.ask = async () => 'Respuesta de prueba';
        this.classifyMessage = async () => 'OTHER';
        this.formatInput = async () => 'FORMATTED';
        this.initializeRAG = async () => {};
      }
    }
  };
});

vi.mock('../../services/AppointmentService', () => {
  return {
    AppointmentService: class {
      async createAppointment() { return { id: 'test' }; }
      async getUserAppointments() { return []; }
    }
  };
});

vi.mock('../../services/CalendarService', () => ({ CalendarServiceAccount: class { async createEvent() {} } }));
vi.mock('../../services/CalendarServiceActiveUser', () => ({ CalendarServiceActiveUser: class { parseDateTime() { return '2025-12-23T10:00:00Z'; } async createCalendarEvent() {} } }));

import { useChatLogic } from '../../hooks/useChatLogic';

function TestComponent({ session }) {
  const { messages, typing, handleSend } = useChatLogic(session);
  return (
    <div>
      <div data-testid="typing">{String(typing)}</div>
      <ul data-testid="msgs">
        {messages.map((m, i) => (
          <li key={i}>{m.sender}: {m.message}</li>
        ))}
      </ul>
      <button onClick={() => handleSend('Hola prueba')}>Send</button>
    </div>
  );
}

describe('useChatLogic integration', () => {
  test('handleSend appends user message and receives LLM reply', async () => {
    const session = { user: { id: 'user-1' } };
    render(<TestComponent session={session} />);

    const sendBtn = screen.getByText('Send');
    await act(async () => {
      await userEvent.click(sendBtn);
    });

    const items = screen.getAllByRole('listitem');
    const texts = items.map(n => n.textContent);
    expect(texts.some(t => t.includes('user'))).toBe(true);
    expect(texts.some(t => t.includes('Respuesta de prueba'))).toBe(true);
  });
});
