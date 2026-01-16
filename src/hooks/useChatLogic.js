import { useState, useEffect, useRef } from 'react';
import { ChatGPTService } from '../services/ChatGPTService';
import { config } from '../config/env.config';
import { CalendarServiceAccount } from '../services/CalendarService';
import { CalendarServiceActiveUser } from '../services/CalendarServiceActiveUser';
import { SPEAK_PROMPT, DATE_PROMPT, TIME_PROMPT, PHONE_PROMPT, NAME_PROMPT } from '../utils/prompts';
import { formatNameResponse, formatPhoneResponse, formatDateResponse, formatTimeResponse, validateDateAgainstBusiness, validateTimeAgainstBusiness } from '../utils/userInputFormatters';
import { businessConfig } from '../config/business.config';
import { AppointmentService } from '../services/AppointmentService';

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
    const appointmentService = new AppointmentService();

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
    const [appointmentsVersion, setAppointmentsVersion] = useState(0);

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
        const raw = await chatGPTServiceRef.current.formatInput(message, NAME_PROMPT);
        console.log(raw, '-> raw name response');
        const res = formatNameResponse(raw);
        if (!res.ok) {
            sendChatGPTMessage("No he podido entender el nombre. Por favor, proporcione un nombre válido (nombre y apellido).");
            return;
        }
        setEventDetails(prev => ({ ...prev, name: res.value }));
        sendChatGPTMessage("Muchas gracias, a continuación proporcione tu número de teléfono.");
        setCurrentStep(2);
    }

    async function dataExtractionCase2(message) {
    const raw = await chatGPTServiceRef.current.formatInput(message, PHONE_PROMPT);
        console.log(raw, '-> raw phone response');
    const res = formatPhoneResponse(raw);
    if (!res.ok) {
        sendChatGPTMessage("No he podido entender el número. Por favor, proporcione un número válido español (9 dígitos) sin espacios ni guiones.");
        return;
    }
    setEventDetails(prev => ({ ...prev, phone: res.value }));
    sendChatGPTMessage("Gracias, ahora necesito la fecha cuando quiera la cita");
    setCurrentStep(3);
}

    async function dataExtractionCase3(message) {
    const raw = await chatGPTServiceRef.current.formatInput(message, DATE_PROMPT);
        console.log(raw, '-> raw date response');
    const res = formatDateResponse(raw);
    if (!res.ok) {
        sendChatGPTMessage("No he podido entender la fecha. Por favor, indique una fecha en formato dd/mm/aaaa o dígala en palabras (ej: 'mañana', 'el próximo lunes').");
        return;
    }
    // validate against business schedule (weekend / closed day)
    const dateValidation = validateDateAgainstBusiness(res.value, businessConfig);
    if (!dateValidation.ok) {
        sendChatGPTMessage(dateValidation.message || 'La fecha seleccionada no está disponible. Por favor elija otro día.');
        return;
    }
    setEventDetails(prev => ({ ...prev, date: res.value }));
    sendChatGPTMessage("¿A qué hora querría la cita?");
    setCurrentStep(4);
}
    async function addToCalendar(finalDetails) {
        try {
        setEventDetails(finalDetails);
        // Guardar en Supabase
        await appointmentService.createAppointment(finalDetails, session.user.id);
        // bump appointmentsVersion so parent can refresh list
        setAppointmentsVersion(v => v + 1);
        // Evento en calendario de cuenta de servicio
        await calendarServiceAccount.createEvent(finalDetails);
        // Evento en calendario del usuario
        await calendarServiceActiveUser.createCalendarEvent(session, finalDetails);

        sendChatGPTMessage("Gracias, tu cita ha sido programada y guardada.");

        // Resetear estados
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
    }
    async function dataExtractionCase4(message) {
    const raw = await chatGPTServiceRef.current.formatInput(message, TIME_PROMPT);
    console.log(raw, '-> raw time response');
    const res = formatTimeResponse(raw);
    if (!res.ok) {
        sendChatGPTMessage("No he podido entender la hora. Por favor, indique una hora en formato HH:mm (por ejemplo 18:00) o dígala en palabras (por ejemplo 'a las seis de la tarde').");
        return;
    }
    const timeFormatted = res.value;
    // validate time against business hours for selected date
    const timeValidation = validateTimeAgainstBusiness(eventDetails.date, timeFormatted, businessConfig);
    if (!timeValidation.ok) {
        sendChatGPTMessage(timeValidation.message || 'La hora seleccionada no está disponible. Por favor elija otra hora dentro del horario laboral.');
        return;
    }
    // Combinar fecha + hora
    const extractedDateTime = calendarServiceActiveUser.parseDateTime(eventDetails.date, timeFormatted);
    console.log(eventDetails.date, '-> eventDetails.date');
    console.log(extractedDateTime, '-> extractedDateTime');

    if (!extractedDateTime || extractedDateTime === 'INVALID') {
        sendChatGPTMessage('Error al interpretar la fecha y la hora. Por favor, revise que la fecha y la hora sean correctas.');
        return;
    }
    // Construir objeto completo de cita
    const finalDetails = {
        ...eventDetails,
        time: timeFormatted,
        dateTime: extractedDateTime
    };
    await addToCalendar(finalDetails);

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
                    const responseMessage = await chatGPTServiceRef.current.ask([...messages, newMessage], SPEAK_PROMPT);
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
                const responseMessage = await chatGPTServiceRef.current.ask([...messages, newMessage], SPEAK_PROMPT);
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
        confirm,
        appointmentsVersion
    };
}