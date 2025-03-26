/**
 * Example Business Configuration
 
Copia el Archivo: Crea una copia de este archivo como business.config.js
Rellena la Información: Reemplaza todos los valores de ejemplo con la información real de tu negocio
Elimina Secciones: Quita las secciones que no apliquen a tu negocio
Añade Detalles: Expande las secciones relevantes con más información específica
Revisa el Formato: Asegúrate de que todos los valores están correctamente formateados

**/
export const businessConfig = {
    // Nombre y detalles básicos del negocio
    business: {
        name: "Mi Empresa S.L.", // Nombre legal de la empresa
        tradingName: "Mi Empresa", // Nombre comercial (si es diferente)
        tagline: "Tu eslogan aquí", // Eslogan o lema de la empresa
        yearFounded: 2024, // Año de fundación
        industry: "Tu Industria", // Sector principal
        description: "Breve descripción de tu empresa y lo que hace", // 1-2 frases
    },

    // Información detallada de contacto y ubicación
    contact: {
        address: {
            street: "Calle Principal 123",
            city: "Ciudad",
            state: "Provincia",
            zipCode: "28001",
            country: "España"
        },
        phone: {
            main: "+34 900 123 456", // Teléfono principal
            support: "+34 900 123 457", // Teléfono de soporte (opcional)
            whatsapp: "+34 600 123 456" // WhatsApp (opcional)
        },
        email: {
            info: "info@miempresa.com",
            support: "soporte@miempresa.com",
            sales: "ventas@miempresa.com"
        },
        social: {
            website: "www.miempresa.com",
            linkedin: "linkedin.com/company/miempresa",
            twitter: "@miempresa",
            instagram: "@miempresa"
        },
        hours: {
            weekdays: "9:00 - 18:00",
            saturday: "10:00 - 14:00", // Eliminar si no abre
            sunday: "Cerrado",
            holidays: "Cerrado",
            timezone: "CET",
            exceptions: "Cerrado festivos nacionales y locales"
        }
    },

    // Productos y servicios ofrecidos
    offerings: {
        mainProducts: [ // Para empresas de productos
            {
                name: "Producto 1",
                description: "Descripción detallada del producto",
                features: ["Característica 1", "Característica 2"],
                priceRange: "XX€ - YY€",
                availability: "Inmediata/Bajo pedido",
                warranty: "2 años"
            }
        ],
        mainServices: [ // Para empresas de servicios
            {
                name: "Servicio 1",
                description: "Descripción detallada del servicio",
                included: ["Item 1", "Item 2"],
                priceRange: "XX€ - YY€",
                duration: "X semanas",
                deliverables: ["Entregable 1", "Entregable 2"]
            }
        ],
        specialties: [
            "Especialidad 1",
            "Especialidad 2",
            "Especialidad 3"
        ]
    },

    // Valores y cultura empresarial
    company: {
        mission: "Tu declaración de misión aquí",
        vision: "Tu visión de futuro aquí",
        values: [
            "Valor 1: Explicación",
            "Valor 2: Explicación",
            "Valor 3: Explicación"
        ],
        uniqueSellingPoints: [
            "Ventaja competitiva 1",
            "Ventaja competitiva 2",
            "Ventaja competitiva 3"
        ],
        certifications: [ // Opcional
            {
                name: "ISO 9001",
                year: "2024",
                description: "Gestión de Calidad"
            }
        ]
    },

    // Preguntas frecuentes
    faq: [
        {
            question: "Pregunta frecuente 1?",
            answer: "Respuesta detallada a la pregunta 1."
        },
        {
            question: "Pregunta frecuente 2?",
            answer: "Respuesta detallada a la pregunta 2."
        }
    ],

    // Políticas importantes
    policies: {
        payment: {
            methods: ["Tarjeta", "Transferencia", "PayPal"],
            terms: "Condiciones de pago",
            refund: "Política de devoluciones"
        },
        privacy: {
            dataHandling: "Cómo manejamos los datos",
            gdprCompliance: "Cumplimiento RGPD"
        },
        delivery: { // Si aplica
            national: "Política de envíos nacionales",
            international: "Política de envíos internacionales",
            timeframes: "Plazos de entrega estimados"
        }
    },

    // Configuración del chatbot
    chatbot: {
        greeting: "¡Hola! ¿En qué puedo ayudarte hoy?",
        style: "profesional", // profesional, casual, formal
        languages: ["Español", "Inglés"], // idiomas soportados
        defaultResponses: {
            outOfHours: "Estamos cerrados. Volveremos en horario comercial.",
            unavailable: "No tengo esa información. ¿Quieres contactar con un agente?",
            timeout: "¿Sigues ahí? La conversación se cerrará en 2 minutos."
        },
        topics: [ // Temas principales que el chatbot debe manejar
            "Información General",
            "Productos/Servicios",
            "Precios",
            "Soporte",
            "Contacto"
        ]
    }
};