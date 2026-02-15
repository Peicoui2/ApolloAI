📘 ApolloAI — Chatbot Empresarial con PLN + RAG + Gestión Automática de Citas

Diseño e implementación de un asistente conversacional híbrido para entornos empresariales, capaz de recuperar conocimiento (RAG), responder con contexto y ejecutar acciones transaccionales (p. ej., creación de citas).

🧩 Descripción General

ApolloAI es un asistente conversacional que combina dos paradigmas:

1. Recuperación Aumentada por Generación (RAG)
Permite responder a consultas abiertas con información relevante extraída de una base de conocimiento mediante búsqueda semántica.

2. Flujo Conversacional Transaccional
Guía al usuario paso a paso por un proceso estructurado (por ejemplo, reserva de citas), validando cada dato antes de ejecutar la acción real con APIs externas (Google Calendar).

Este enfoque híbrido reduce alucinaciones, estandariza la captura de datos y permite actuar —no solo conversar.

🧱 Arquitectura de Software

La aplicación está planteada como una web moderna con separación frontend/backend.

Frontend (React / Next.js)
        ↓
Backend API (Node.js)
        ↓
Servicios Externos
   - OpenAI API (LLM + Embeddings)
   - Google Calendar API
   - Base de conocimientos / vector store


Componentes clave:

Cliente Web (UI): Interfaz conversacional.

Router/Agente Backend: Decide si una entrada se responde vía RAG o vía flujo transaccional.

RAG Engine: Recuperación semántica con embeddings + llamada LLM.

State Machine (Máquina de estados): Gestión estructurada de procesos como reserva de citas.

Integración Google Calendar: Automatización de eventos.

📂 Estructura del Proyecto

Estos son los elementos principales visibles en el repositorio:

.github/
public/
src/
.env.example
README.md
package.json
vite.config.js
eslint.config.js
vitest.config.js
index.html

📌 Archivo .env.example

Incluye variables de entorno requeridas para:

Claves de OpenAI

Credenciales de Google Calendar

Configuración de la base de conocimientos

Claves relacionadas con RAG y PLN

Asegúrate de rellenar correctamente este archivo con tus credenciales antes de ejecutar el proyecto.

🧠 Flujo Conversacional Híbrido

El núcleo lógico del chatbot se basa en dos mecanismos:

🔹 RAG (Respuesta con Contexto)

El usuario envía un mensaje libre.

Se genera un embedding del texto.

Se realiza una búsqueda semántica contra una base vectorial.

Se recupera el contexto relevante.

Ese contexto se inyecta como parte del prompt al LLM para una respuesta contextualizada.

Esto permite ofrecer respuestas informativas, basadas en datos existentes, evitando contenido no sustentado por la base de conocimiento.

🔹 Flujo Transaccional Estructurado

Si el usuario quiere realizar una acción (como reservar una cita), el sistema:

Reconoce la intención transaccional.

Activa una máquina de estados específica para ese flujo.

Solicita datos en un orden fijo (ej. servicio, fecha, hora).

Valida cada campo (formato correcto).

Llama a la API correspondiente (Google Calendar) para crear el evento real.

Esto elimina ambigüedades y garantiza que solo se ejecute si toda la información es válida.

📌 Integración con Google Calendar

Para habilitar la funcionalidad de gestión de citas, se requiere:

Crear un proyecto en Google Cloud Console.

Activar la Calendar API.

Crear una cuenta de servicio y descargar el JSON de credenciales.

Compartir tu calendario con esa cuenta para permitir modificaciones.

Guardar el JSON de credenciales y las variables de entorno necesarias en tu proyecto.

🛠️ Instalación y Ejecución
1. Clona el repositorio
git clone https://github.com/Peicoui2/ApolloAI.git

2. Instala dependencias
npm install

3. Configura variables de entorno

Copia .env.example a .env y completa con tus credenciales:

cp .env.example .env


Rellena:

OPENAI_API_KEY=
GOOGLE_CALENDAR_CREDENTIALS=
...

4. Ejecuta la aplicación en desarrollo
npm run dev


El frontend se levantará usualmente en localhost:3000 (según configuración de Vite/Next.js).

🧪 Pruebas y Calidad

La configuración incluye:

ESLint (linting)

Vitest (testing)

Puedes ejecutar pruebas con:

npm test


Asegúrate de que la base de conocimientos esté adecuadamente configurada para que los tests de recuperación semántica funcionen correctamente.

🧠 Decisiones Técnicas Clave

RAG + LLM en el centro de la lógica para respuestas informacionales.

Flujos transaccionales estructurados para acciones como reserva de citas.

Separación total entre conversación libre y acciones.

Integración externa con APIs empresariales (Calendar).

Sistema preparado para producir respuestas consistentes sin alucinaciones significativas.

📌 Requisitos

Node.js (v18+ recomendado)

Variables de entorno bien configuradas

Acceso a servicios externos (OpenAI, Google)

Navegador moderno para la UI

📦 Dependencias Principales

Referenciadas en package.json (visibles tras clonar):

React / Next.js

Linter ESLint

Vitest para tests

Paquetes para integración con APIs y RAG/embeddings

Fetch/HTTP client para backend → servicios externos

🧭 Buenas Prácticas de Uso

Nunca subir .env con claves.

Validar cada respuesta transaccional antes de ejecutar la acción.

Guardar logs de contexto RAG para auditoría.

Versionar la base de conocimiento para reproducibilidad.
