import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock ChatGPTService to prevent importing main (which calls createRoot)
vi.mock('../../services/ChatGPTService', () => ({ ChatGPTService: class { constructor(){ } initializeRAG = async () => {} } }));

// Mock main (supabase client) so importing services doesn't run actual createRoot
vi.mock('../../main', () => ({ supabase: {} }));

// Mock AppointmentService to avoid importing main inside it
vi.mock('../../services/AppointmentService', () => ({ AppointmentService: class { async getUserAppointments(){ return []; } } }));

// Mock the importInjector to provide minimal components and hooks used by App
vi.mock('../../utils/importInjector', () => ({
  imports: {
    MainContainer: ({ children }) => <div data-testid="main">{children}</div>,
    ChatContainer: ({ children }) => <div data-testid="chat">{children}</div>,
    MessageList: ({ children }) => <div data-testid="ml">{children}</div>,
    MessageInput: (props) => <div data-testid="mi" />,
    TypingIndicator: (props) => <div data-testid="ti">{props.content}</div>,
    useSession: () => null,
    useSupabaseClient: () => ({ auth: { signInWithOAuth: async () => ({}) } }),
    useSessionContext: () => ({ isLoading: false })
  }
}));

import App from '../../App';

describe('App component', () => {
  test('renders SignIn when no session', () => {
    render(<App />);
    expect(screen.getByLabelText(/Sign in with Google/i)).toBeInTheDocument();
  });
});
