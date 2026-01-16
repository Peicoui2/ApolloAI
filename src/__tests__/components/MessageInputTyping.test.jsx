import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';

// Mock useChatLogic to simulate typing state
vi.mock('../../hooks/useChatLogic', () => ({
  useChatLogic: () => ({ messages: [], typing: true, handleSend: () => {} }),
}));

// Mock importInjector to provide lightweight replacements for chat UI components
vi.mock('../../utils/importInjector', () => ({
  imports: {
    MainContainer: ({ children }) => <div data-testid="main-container">{children}</div>,
    ChatContainer: ({ children }) => <div data-testid="chat-container">{children}</div>,
    MessageList: ({ children, typingIndicator }) => (
      <div data-testid="message-list">
        {children}
        {typingIndicator}
      </div>
    ),
    MessageInput: ({ placeholder }) => (
      <input data-testid="message-input" placeholder={placeholder} />
    ),
    TypingIndicator: ({ content }) => (
      <div data-testid="typing-indicator">{content}</div>
    ),
    useSession: () => ({ user: { id: 'u1' } }),
    useSupabaseClient: () => ({}),
    useSessionContext: () => ({ isLoading: false }),
  },
}));

// Prevent importing main (which may bootstrap) and services side-effects during test
vi.mock('../../main', () => ({}));
vi.mock('../../services/AppointmentService', () => ({ AppointmentService: class { async getUserAppointments(){ return []; } } }));
vi.mock('../../services/ChatGPTService', () => ({ ChatGPTService: class { constructor(){ } initializeRAG = async () => {} } }));

import App from '../../App';

describe('MessageInput & TypingIndicator integration', () => {
  test('shows typing indicator when useChatLogic.typing is true and MessageInput exists', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByTestId('message-input')).toBeInTheDocument();
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
  });
});
