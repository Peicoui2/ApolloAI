import React from 'react';
import { Message, Avatar } from "@chatscope/chat-ui-kit-react";
import PropTypes from 'prop-types';

export const ChatMessage = ({ msg }) => {
  const isUserMessage = msg.direction === 'outgoing';

  return (
    <div style={{ maxWidth: '600px', minWidth: '300px', overflow: 'hidden' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
        margin: '1rem 0',
        alignItems: 'center'
      }}>
        {!isUserMessage && (
          <div style={{height:'35px', width:'35px', marginRight: '8px'}}>
          <Avatar 
            src="/src/assets/AA-White.svg"
            name={msg.sender}
            style={{
              width: '30px',
              height: '30px',
            
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #404040',
              marginRight: '2px'
            }}
          />
          </div>
        )}
        
        <Message
          model={{
            message: msg.message,
            sentTime: "just now",
            sender: msg.sender,
            direction: msg.direction,
            position: "normal"
          }}
        />

        {isUserMessage && (
          <Avatar 
            src="/src/assets/chat-record-1.svg"
            name={msg.sender}
            size="sm"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #404040',
              marginLeft: '2px'
            }}
          />
        )}
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  msg: PropTypes.shape({
    message: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(['incoming', 'outgoing']).isRequired
  }).isRequired,
};