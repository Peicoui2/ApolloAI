import { Message, Avatar } from "@chatscope/chat-ui-kit-react";
import { styles } from './styles/styles';
import PropTypes from 'prop-types';

export const ChatMessage = ({ msg, index }) => {
    const isUserMessage = msg.direction === 'outgoing';

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
      margin: '1rem 0'
    }}>
      {msg.direction === 'incoming' && (
        <Avatar 
          src="/src/assets/AA-White.svg"
          name={msg.sender}
          size="sm"
          style={{
            ...styles.avatar,
            backgroundColor: '#FFFFFF'
          }}
        />
      )}
      <div className="cs-message" style={{
        padding: '12px',
        borderRadius: '8px',
        maxWidth: '70%'
      }}>
        <Message
          model={{
            message: msg.message,
            sentTime: "just now",
            sender: msg.sender,
            direction: msg.direction,
            position: "normal"
          }}
          style={{
            backgroundColor: 'transparent',
            color: isUserMessage ? '#FFFFFF' : '#000000'
          }}
        />
      </div>
      {msg.direction === 'outgoing' && (
        <Avatar 
          src="/src/assets/chat-record-1.svg"
          name={msg.sender}
          size="sm"
          style={styles.avatar}
        />
      )}
    </div>
  );
};

ChatMessage.propTypes = {
  msg: PropTypes.shape({
    message: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(['incoming', 'outgoing']).isRequired
  }).isRequired,
  index: PropTypes.number.isRequired
};