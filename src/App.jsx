import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react"
const API_KEY = "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"
function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello i am chatgpt",
      sender: "ChatGPT",
      direction: "incoming"
    }

  ])
  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }

    const newMessages = [...messages, newMessage]
    setMessages(newMessages);

    setTyping(true);
    await processMessageToChatGPT(newMessages);

  }


  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((MessageObject) => {
      let role = "";
      if (MessageObject.sender === "ChatGPT") {
        role = "assistant"
      } else {
        role = "user"
      }
      return { role: role, content: MessageObject.message }
    })

    const systemMessage = {
      role: "system",
      content: "Explain all concepts like im the best scientisc on this topic in the world"
    }


    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT",
        direction: "incoming"
      }]
      );
      setTyping(false);
    });
  }

  return (
    <div className='App'>
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior='smooth'
              typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder='Type message here' onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App
