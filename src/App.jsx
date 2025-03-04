import { imports } from "./utils/importInjector";
const {
  useState,
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  useSession,
  useSupabaseClient,
  useSessionContext,
  ChatGPTService,
  CalendarService,
  DATE_PROMPT,
  PROMPT_HABLAR,
  TIME_PROMPT,
  PHONE_PROMPT,
  config,
} = imports;

function App() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const chatGPTService = new ChatGPTService(config.OPENAI_API_KEY);
  const calendarService = new CalendarService();


  const [typing, setTyping] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    dateTime: null
  });
  const [messages, setMessages] = useState([
    { message: "Comienza la conversación", sender: "ChatGPT", direction: "incoming" },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const { isLoading } = useSessionContext();


  // Add error handling
  if (isLoading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.5rem',
      fontWeight: 'bold'
    }}>
      Loading...
    </div>
  );

  function sendChatGPTMessage(message) {
    setMessages((prevMessages) => [
      ...prevMessages,
      { message, sender: "ChatGPT", direction: "incoming" },
    ]);
  }

  async function dataExtractionCase1(message) {
    let nameFormatted = await chatGPTService.formatInput(message, "name");
   
   if(nameFormatted && nameFormatted !== "INVALID") {
      eventDetails.name = nameFormatted;
      sendChatGPTMessage("Muchas gracias, a continuación proporcione tu número de teléfono.");
      setCurrentStep(2);
    } else {
      sendChatGPTMessage("No he podido entender el nombre. Por favor, proporcione un nombre válido.");
    }
 

  }
  async function dataExtractionCase2(message) {
    let phoneFormatted = await chatGPTService.formatInput(message, PHONE_PROMPT);

    if (phoneFormatted && phoneFormatted !== "INVALID") {
      eventDetails.phone = phoneFormatted;
      sendChatGPTMessage("Gracias, ahora necesito la fecha cuando quiera la cita");
      setCurrentStep(3);
    } else {
      sendChatGPTMessage("No he podido entender el número de teléfono. Por favor, proporcione un número válido español (9 dígitos).");
    }
  }

  async function dataExtractionCase3(message) {
    let dateResponse = await chatGPTService.formatInput(message, DATE_PROMPT);

    if (dateResponse && dateResponse !== "INVALID") {
      eventDetails.date = dateResponse;
      sendChatGPTMessage("¿A qué hora querría la cita?");
      setCurrentStep(4);
    } else {
      sendChatGPTMessage("No he podido entender la fecha. Por favor, proporcione una fecha válida en formato dd/mm/aaaa o dígala en palabras (ej: 'mañana', 'el próximo lunes')");
    }

  }


  async function dataExtractionCase4(message) {
    let timeFormatted = await chatGPTService.formatInput(message, TIME_PROMPT);
    
    console.log(timeFormatted, '->  time');
    console.log(eventDetails.date, '->  date');

    let extractedDateTime = calendarService.parseDateTime(eventDetails.date, timeFormatted);

    if (extractedDateTime && extractedDateTime !== "INVALID") {
      eventDetails.time = timeFormatted;
      eventDetails.dateTime = extractedDateTime;
      
      try {
        // Set all collected details at once
        setEventDetails(eventDetails);
        await calendarService.createCalendarEvent(session, eventDetails);
        sendChatGPTMessage("Gracias, tu cita ha sido programada.");
      } catch (error) {
        console.error('Calendar error:', error);
        sendChatGPTMessage("Lo siento, hubo un error al programar la cita. Por favor, inténtelo de nuevo.");
      }

      setCurrentStep(0);
      setConfirm(false);
      setIsScheduling(false);
      
     
    } else {
      sendChatGPTMessage("Error en el formato de fecha y hora. Por favor, inténtelo de nuevo.");
    }

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

    }

    if (confirm) {
      if (isScheduling) {
        switch (currentStep) {
          case 0:
            sendChatGPTMessage("Para proceder voy a pedirle unos datos. Por favor, proporcione su nombre completo.");
            setCurrentStep(1);
            break;
          case 1:
            dataExtractionCase1(message); 
            break;
          case 2:
            dataExtractionCase2(message);

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
      <div style={{ position: 'relative', height: '85vh', width: '100vh', marginBottom: '3rem' }}>
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
                      {msg.sender === "ChatGPT" ?
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
