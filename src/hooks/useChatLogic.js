import { useState, useEffect, useRef } from 'react';
import { ChatGPTService } from '../services/ChatGPTService';
import { config } from '../config/env.config';
import { CalendarServiceAccount } from '../services/CalendarService';
import { CalendarServiceActiveUser } from '../services/CalendarServiceActiveUser';
import { PROMPT_HABLAR, DATE_PROMPT, TIME_PROMPT, PHONE_PROMPT, NAME_PROMPT } from '../utils/prompts';

export function useChatLogic(session) {
    const chatGPTServiceRef = useRef(null);

    // Initialize ChatGPTService only once
    useEffect(() => {
        if (!chatGPTServiceRef.current) {
            chatGPTServiceRef.current = new ChatGPTService(config.OPENAI_API_KEY);
        }
    }, []);

    // Initialize RAG when session is available
    useEffect(() => {
        if (session && chatGPTServiceRef.current) {
            chatGPTServiceRef.current.initializeRAG().catch(console.error);
        }
    }, [session]);

    // Initialize services internally
    const calendarServiceAccount = new CalendarServiceAccount();
    const calendarServiceActiveUser = new CalendarServiceActiveUser();

    // Rest of your existing state declarations
    const [messages, setMessages] = useState([
        { message: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?", sender: "ChatGPT", direction: "incoming" }
    ]);
    const [typing, setTyping] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [eventDetails, setEventDetails] = useState({
        name: "",
        phone: "",
        date: "",
        time: "",
        reason: "",
        dateTime: null
    });

    // Local event details object for temporary storage
 

    const sendChatGPTMessage = (message) => {
        setMessages(prevMessages => [...prevMessages, {
            message,
            sender: "ChatGPT",
            direction: "incoming"
        }]);
    };

    // Data extraction cases
    async function dataExtractionCase1(message) {
        let nameFormatted = await chatGPTServiceRef.current.formatInput(message, NAME_PROMPT);
        console.log(nameFormatted,"-> nameFormatted");
        if(nameFormatted && nameFormatted !== "INVALID") {
            eventDetails.name = nameFormatted;
            sendChatGPTMessage("Muchas gracias, a continuación proporcione tu número de teléfono.");
            setCurrentStep(2);
        } else {
            sendChatGPTMessage("No he podido entender el nombre. Por favor, proporcione un nombre válido.");
        }
    }

    async function dataExtractionCase2(message) {
        let phoneFormatted = await chatGPTServiceRef.current.formatInput(message, PHONE_PROMPT);
        console.log(phoneFormatted,"-> phoneFormatted");
        if (phoneFormatted && phoneFormatted !== "INVALID") {
            eventDetails.phone = phoneFormatted;
            sendChatGPTMessage("Gracias, ahora necesito la fecha cuando quiera la cita");
            setCurrentStep(3);
        } else {
            sendChatGPTMessage("No he podido entender el número de teléfono. Por favor, proporcione un número válido español (9 dígitos).");
        }
    }

    async function dataExtractionCase3(message) {
        let dateResponse = await chatGPTServiceRef.current.formatInput(message, DATE_PROMPT);
        console.log(dateResponse,"-> dateResponse");
        if (dateResponse && dateResponse !== "INVALID") {
            eventDetails.date = dateResponse;
            sendChatGPTMessage("¿A qué hora querría la cita?");
            setCurrentStep(4);
        } else {
            sendChatGPTMessage("No he podido entender la fecha. Por favor, proporcione una fecha válida en formato dd/mm/aaaa o dígala en palabras (ej: 'mañana', 'el próximo lunes')");
        }
    }

    async function dataExtractionCase4(message) {
        let timeFormatted = await chatGPTServiceRef.current.formatInput(message, TIME_PROMPT);
        let extractedDateTime = calendarServiceActiveUser.parseDateTime(eventDetails.date, timeFormatted);
        console.log(eventDetails.date,"-> localEventDetails.date");
        console.log(timeFormatted,"-> timeFormatted");
        console.log(extractedDateTime,"-> extractedDateTime");

        if (extractedDateTime && extractedDateTime !== "INVALID") {
            eventDetails.time = timeFormatted;
            eventDetails.dateTime = extractedDateTime;
            
            try {
                // Set all collected details at once
                setEventDetails(eventDetails);

                // Add to service account
                await calendarServiceAccount.createEvent(eventDetails);
                // Add to personal user account
                await calendarServiceActiveUser.createCalendarEvent(session, eventDetails);

                sendChatGPTMessage("Gracias, tu cita ha sido programada.");

                // Reset states
                setCurrentStep(0);
                setConfirm(false);
                setIsScheduling(false);
               
            } catch (error) {
                if (error.message.includes('Ya existe una cita')) {
                    sendChatGPTMessage("Lo siento, ya hay una cita programada para esa fecha y hora. Por favor, elige otro horario.");
                } else {
                    sendChatGPTMessage("Lo siento, hubo un error al programar la cita. Por favor, inténtelo de nuevo.");
                }
            }
        } else {
            sendChatGPTMessage("Error en el formato de fecha y hora. Por favor, inténtelo de nuevo.");
        }
    }

    const handleSend = async (message) => {
        const newMessage = { message, sender: "user", direction: "outgoing" };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setTyping(true);

        try {
            if (!confirm) {
                const schedulingIntent = await chatGPTServiceRef.current.classifyMessage(newMessage);
                const isSchedulingIntent = schedulingIntent === "PROGRAMAR";

                if (isSchedulingIntent) {
                    setConfirm(true);
                    setIsScheduling(true);
                    sendChatGPTMessage("Para proceder voy a pedirle unos datos. Por favor, proporcione su nombre completo.");
                    setCurrentStep(1);
                } else {
                    const responseMessage = await chatGPTServiceRef.current.ask([...messages, newMessage], PROMPT_HABLAR);
                    sendChatGPTMessage(responseMessage);
                }
            } else if (isScheduling) {
                switch (currentStep) {
                    case 1:
                        await dataExtractionCase1(message);
                        break;
                    case 2:
                        await dataExtractionCase2(message);
                        break;
                    case 3:
                        await dataExtractionCase3(message);
                        break;
                    case 4:
                        await dataExtractionCase4(message);
                        break;
                    default:
                        break;
                }
            } else {
                const responseMessage = await chatGPTServiceRef.current.ask([...messages, newMessage], PROMPT_HABLAR);
                sendChatGPTMessage(responseMessage);
            }
        } catch (error) {
            console.error('Chat error:', error);
            sendChatGPTMessage("Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.");
        } finally {
            setTyping(false);
        }
    };

    return {
        messages,
        typing,
        currentStep,
        eventDetails,
        handleSend,
        isScheduling,
        confirm
    };
}