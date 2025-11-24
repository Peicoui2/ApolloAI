import { useState, useEffect, useRef } from 'react';
import { ChatGPTService } from '../services/ChatGPTService';
import { config } from '../config/env.config';
import { CalendarServiceAccount } from '../services/CalendarService';
import { CalendarServiceActiveUser } from '../services/CalendarServiceActiveUser';
import { PROMPT_HABLAR, DATE_PROMPT, TIME_PROMPT, PHONE_PROMPT, NAME_PROMPT } from '../utils/prompts';
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
        console.log(nameFormatted, "-> nameFormatted");

        let normalized = (nameFormatted || "").trim();        // Normalizar
        normalized = normalized.replace(/^"(.*)"$/, "$1").trim();        // Quitar comillas exteriores si las hay
        // Tratar como inválido si:
        // - está vacío
        // - es "INVALID" en cualquier combinación de mayúsculas/minúsculas
        if (!normalized || normalized.toUpperCase() === "INVALID") {
            sendChatGPTMessage("No he podido entender el nombre. Por favor, proporcione un nombre válido (nombre y apellido).");
            return;
        }
        //validación extra por si el modelo se equivoca:
        const hasNumbers = /\d/.test(normalized);
        const parts = normalized.split(/\s+/);
        if (hasNumbers || parts.length < 2) {
            sendChatGPTMessage("Por favor, indique nombre y apellido.");
            return;
        }

        setEventDetails(prev => ({
            ...prev,
            name: normalized
        }));

        sendChatGPTMessage("Muchas gracias, a continuación proporcione tu número de teléfono.");
        setCurrentStep(2);
    }

    async function dataExtractionCase2(message) {
    let phoneFormatted = await chatGPTServiceRef.current.formatInput(message, PHONE_PROMPT);
        console.log(phoneFormatted, "-> phoneFormatted");
    let normalized = (phoneFormatted || "").trim();    // Normalizar respuesta
    normalized = normalized.replace(/^"(.*)"$/, "$1").trim();    // Quitar comillas exteriores si las hubiera
    // Tratar como inválido si está vacío o es "INVALID" (en cualquier forma)
    if (!normalized || normalized.toUpperCase() === "INVALID") {
        sendChatGPTMessage(
            "No he podido entender el número. Por favor, proporcione un número válido español (9 dígitos)."
        );
        return;
    }
    // Validación extra por si el modelo se equivoca de formato
    const phoneRegex = /^\+34 \d{3} \d{3} \d{3}$/;
    if (!phoneRegex.test(normalized)) {
        sendChatGPTMessage("El número no parece tener el formato correcto (+34 XXX XXX XXX). Inténtelo de nuevo, por favor.");
        return;
    }
    // Guardar usando setEventDetails (no mutar directamente)
    setEventDetails(prev => ({...prev,phone: normalized}));

    sendChatGPTMessage("Gracias, ahora necesito la fecha cuando quiera la cita");
    setCurrentStep(3);
}

    async function dataExtractionCase3(message) {
    let dateResponse = await chatGPTServiceRef.current.formatInput(message, DATE_PROMPT);
        console.log(dateResponse, "-> dateResponse");
    let normalized = (dateResponse || "").trim();    // Normalizar respuesta
    normalized = normalized.replace(/^"(.*)"$/, "$1").trim();    
    // Tratar como inválido si está vacío o es INVALID en cualquier forma
    if (!normalized || normalized.toUpperCase() === "INVALID") {
        sendChatGPTMessage("No he podido entender la fecha. Por favor, indique una fecha en formato dd/mm/aaaa o dígala en palabras (ej: 'mañana', 'el próximo lunes').");
        return;
    }
    // Validación básica de formato dd/mm/aaaa
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(normalized)) {
        sendChatGPTMessage("La fecha no tiene el formato correcto. Use dd/mm/aaaa (por ejemplo 25/03/2025) o dígala en palabras.");
        return;
    }

    setEventDetails(prev => ({...prev,date: normalized}));

    sendChatGPTMessage("¿A qué hora querría la cita?");
    setCurrentStep(4);
}
    async function addToCalendar(finalDetails) {
        try {
        setEventDetails(finalDetails);
        // Guardar en Supabase
        await appointmentService.createAppointment(finalDetails, session.user.id);
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
    let timeFormattedRaw = await chatGPTServiceRef.current.formatInput(message, TIME_PROMPT);
    let timeFormatted = (timeFormattedRaw || "").trim();    // Normalizar
    timeFormatted = timeFormatted.replace(/^"(.*)"$/, "$1").trim();
        console.log(timeFormatted, "-> timeFormatted (normalizado)");
    // Comprobar "INVALID" o vacío
    if (!timeFormatted || timeFormatted.toUpperCase() === "INVALID") {
        sendChatGPTMessage("No he podido entender la hora. Por favor, indique una hora en formato HH:mm (por ejemplo 18:00) o dígala en palabras (por ejemplo 'a las seis de la tarde').");
        return;
    }

    // Validación básica de HH:mm
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(timeFormatted)) {
        sendChatGPTMessage("La hora no tiene el formato correcto. Use HH:mm en formato 24h (por ejemplo 09:30, 18:00).");
        return;
    }
    // Combinar fecha + hora
    const extractedDateTime = calendarServiceActiveUser.parseDateTime(eventDetails.date, timeFormatted);
    console.log(eventDetails.date, "-> eventDetails.date");
    console.log(extractedDateTime, "-> extractedDateTime");

    if (!extractedDateTime || extractedDateTime === "INVALID") {
        sendChatGPTMessage(
            "Error al interpretar la fecha y la hora. Por favor, revise que la fecha y la hora sean correctas."
        );
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