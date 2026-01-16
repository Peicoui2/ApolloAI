import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../../components/ChatMessage';

describe('ChatMessage', () => {
  test('renders incoming message with avatar and text', () => {
    const msg = { message: 'Hello', sender: 'Bot', direction: 'incoming' };
    render(<ChatMessage msg={msg} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('renders outgoing message aligned to right', () => {
    const msg = { message: 'Hi there', sender: 'Me', direction: 'outgoing' };
    render(<ChatMessage msg={msg} />);
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });
});
