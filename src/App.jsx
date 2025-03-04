import { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { useSession, useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react";

import { ChatGPTService } from "./utils/ChatGPTService";
import { CalendarService } from "./utils/CalendarService";
import { DATE_PROMPT, PROMPT_HABLAR, TIME_PROMPT } from './constants/prompts';

const OPENAI_API_KEY = "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";


function App() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [typing, setTyping] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
  });
  const [messages, setMessages] = useState([
    { message: "Comienza la conversación", sender: "ChatGPT", direction: "incoming" },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const { isLoading } = useSessionContext();

  // Create services as constants
  const chatGPTService = new ChatGPTService(OPENAI_API_KEY);
  const calendarService = new CalendarService();

  // Add error handling
  if (isLoading) return <div>Loading...</div>;

  function sendChatGPTMessage(message) {
    setMessages((prevMessages) => [
      ...prevMessages,
      { message, sender: "ChatGPT", direction: "incoming" },
    ]);
  }

  
  async function dataExtractionCase3(message) {
    let dateResponse = await chatGPTService.formatInput(message, DATE_PROMPT);
    if (dateResponse && dateResponse !== "INVALID") {
      eventDetails.date = dateResponse;
      console.log(eventDetails.date, "-> date");
      sendChatGPTMessage("¿A qué hora querría la cita?);")
      setCurrentStep(4);
    } else {
      sendChatGPTMessage("No he podido entender la fecha. Por favor, proporcione una fecha válida en formato dd/mm/aaaa o dígala en palabras (ej: 'mañana', 'el próximo lunes')");
    }

  }
  async function dataExtractionCase4(message) {
    const timeFormatted = await chatGPTService.formatInput(message, TIME_PROMPT);
    console.log(timeFormatted, '->  time');
    const extractedDateTime = calendarService.parseDateTime(eventDetails.date, timeFormatted);
    if (extractedDateTime) {
      eventDetails.dateTime = extractedDateTime;
      try {
        console.log(session.provider_token, '-> session.provider_token');
        await calendarService.createCalendarEvent(session, eventDetails);
        setEventDetails(eventDetails);

        setMessages((prevMessages) => [...prevMessages, {
          message: "Gracias, tu cita ha sido programada.",
          sender: "ChatGPT",
          direction: "incoming"
        }]);
      } catch (error) {
        console.error('Calendar error:', error);
        setMessages((prevMessages) => [...prevMessages, {
          message: "Lo siento, hubo un error al programar la cita. Por favor, inténtelo de nuevo.",
          sender: "ChatGPT",
          direction: "incoming"
        }]);
      }
    } else {
      setMessages((prevMessages) => [...prevMessages, { message: "Error en el formato de fecha y hora. Por favor, inténtelo de nuevo.", sender: "ChatGPT", direction: "incoming" }]);
    }
    setCurrentStep(0);
    setConfirm(false);
    setIsScheduling(false);
  }




  async function handleSend(message) {
    const newMessage = { message, sender: "user", direction: "outgoing" };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setTyping(true);

    if (!confirm) {
      const schedulingIntent = await chatGPTService.classifyMessage(newMessage);
      const isSchedulingIntent = schedulingIntent === "PROGRAMAR";

      if (isSchedulingIntent) {
        setConfirm(true);
        setIsScheduling(true);
      } else {
        setIsScheduling(false);
      }

      console.log(schedulingIntent, "-> schedulingIntent");
      console.log(confirm, "-> confirm");
    }

    if (confirm) {
      if (isScheduling) {
        switch (currentStep) {
          case 0:
            sendChatGPTMessage("Para proceder voy a pedirle unos datos. Por favor, proporcione su nombre completo.");
            setCurrentStep(1);
            break;
          case 1:
            eventDetails.name = await chatGPTService.formatInput(message, "name");
            console.log(eventDetails.name, '-> name');
            sendChatGPTMessage("Muchas gracias, a continuación proporcione tu número de teléfono.")
            setCurrentStep(2);
            break;
          case 2:
            eventDetails.phone = await chatGPTService.formatInput(message, "+34 XXX XXX XXX");
            console.log(eventDetails.phone, '-> phone');
            sendChatGPTMessage("Gracias, ahora necesito la fecha cuando quiera la cita");
            setCurrentStep(3);
            break;
          case 3: {
            dataExtractionCase3(message);
            break;
          }
          case 4: {
            dataExtractionCase4(message);
            break;
          }
          default:
            break;
        }
      } else {
        const responseMessage = await chatGPTService.ask([...messages, newMessage], PROMPT_HABLAR);
        setMessages((prevMessages) => [...prevMessages, { message: responseMessage, sender: "ChatGPT", direction: "incoming" }]);
      }
    } else {
      const responseMessage = await chatGPTService.ask([...messages, newMessage], PROMPT_HABLAR);
      setMessages((prevMessages) => [...prevMessages, { message: responseMessage, sender: "ChatGPT", direction: "incoming" }]);
    }

    setTyping(false);
  }

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });

    if (error) {
      alert("Error logging in to Google provider with Supabase");
      console.log(error);
    }
  }



  return (
    <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ position: 'relative', height: '85vh', width: '100vh',marginBottom: '3rem' }}>
        {session ? (
          <>
            <MainContainer style={{ borderRadius: '15px', border: '2px solid black' }}>
              <ChatContainer>
                <MessageList
                  scrollBehavior='smooth'
                  typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing" /> : null}
                >
                  {messages.map((msg, i) => (
                    <div key={i} style={{ textAlign: msg.sender === "user" ? 'right' : 'left' }}>
                      {msg.sender === "ChatGPT"?
                          <img
                            src="src/assets/AA-White.svg"
                            alt="ChatGPT Avatar"
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: '2px solid rgb(0, 6, 0)',
                              marginRight: '8px',
                              verticalAlign: 'middle'
                            }}
                          />
                          :
                          <img
                            src="src/assets/chat-record-1.svg"
                            alt="User Avatar"
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: '2px solid rgb(0, 6, 0)',
                              marginLeft: '8px',
                              verticalAlign: 'middle'
                            }}
                            />
                          }
                          <Message key={i} model={msg} />
                    </div>
                  ))}
                </MessageList>
                <MessageInput placeholder="Type message here" onSend={handleSend} />
              </ChatContainer>
            </MainContainer>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '1rem' }}>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  cursor: 'pointer'
                }}
                onClick={() => supabase.auth.signOut()}
              >
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <button
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#4CAF50',
                color: 'white',
                cursor: 'pointer'
              }}
              onClick={() => googleSignIn()}
            >
              Sign In with Google
            </button>
          </div>
        )}
      </div>

        <img
          src="src/assets/AA-White.svg  "
          alt="ChatGPT Avatar"
          style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '4px solid rgb(0, 6, 0)'
          }}></img>

    </div>
  );

  
}

export default App;
