Este Trabajo Fin de Grado se enmarca en el desarrollo de asistentes conversacionales empresariales capaces de informar y actuar. El proyecto propone un chatbot híbrido (“ApolloAI”) que combina un sistema informacional basado en RAG encargado de recuperar fragmentos relevantes de una base de conocimiento mediante búsqueda semántica y generar respuestas basadas en ese contexto con un sistema transaccional que guía al usuario por un flujo de reserva de cita paso a paso, validando y estructurando los datos antes de ejecutar acciones (p. ej., crear eventos).
La arquitectura se apoya en un enfoque de agente/router, donde el sistema decide si la petición del usuario requiere recuperación de conocimiento (RAG), ejecución de acciones (calendario/citas) o una respuesta conversacional general. A nivel tecnológico, el prototipo se plantea sobre un stack web moderno (frontend React/Next.js) y una capa de orquestación para integrar LLM, recuperación semántica y servicios externos.
El objetivo práctico es mostrar la viabilidad de desplegar un asistente útil en un entorno cercano al real. Se demuestra la reducción de la carga operativa, estandarizando la captura de datos (nombre/teléfono/fecha/hora) y mejorando la experiencia del usuario al resolver tareas sin salir del chat.
Palabras Clave: Chatbot, PLN, RAG, LLM, base de conocimiento, búsqueda semántica, asistentes conversacionales, automatización, gestión de citas, integración de APIs.


SETUP SERVICE ACCOUNT:

Go to the Google Cloud Console and create a new project.
Enable the Calendar API
Create a service account
In your calendar where you want to create events, go to the settings and share the calendar with the e-mail of your service account (Make sure to set the permissions to "Make changes to events")
Create and save the credentials JSON for your created account into your Node.JS project
