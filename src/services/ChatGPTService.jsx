import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { supabase } from '../main';
import { businessConfig } from '../config/business.config';

export class ChatGPTService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        // Configure embeddings for Spanish language
        this.embeddings = new OpenAIEmbeddings({
            openAIApiKey: apiKey,
            modelName: "text-embedding-3-small", // Better with multilingual content
            dimensions: 1536,
        });
        this.vectorStore = null;
    }

    async initializeRAG() {
        if (!this.vectorStore) {
            this.vectorStore = new SupabaseVectorStore(this.embeddings, {
                client: supabase,
                tableName: 'documents',
                queryName: 'match_documents'
            });

            await this.ingestBusinessInfo();
            return true;
        }
        return true;
    }

    async ingestBusinessInfo() {
        try {
            const chunks = [];

            // Información de la Empresa
            chunks.push(this.formatSection('Información de la Empresa', {
                'Nombre': businessConfig.business.name,
                'Sector': businessConfig.business.industry,
                'Eslogan': businessConfig.business.tagline,
                'Año de Fundación': businessConfig.business.yearFounded
            }));

            // Información de Contacto
            chunks.push(this.formatSection('Información de Contacto', {
                'Dirección': businessConfig.contact.address,
                'Teléfono': businessConfig.contact.phone,
                'Email': businessConfig.contact.email,
                'Sitio Web': businessConfig.contact.website,
                'Horario Entre Semana': businessConfig.contact.hours.weekdays,
                'Horario Sábado': businessConfig.contact.hours.saturday,
                'Horario Domingo': businessConfig.contact.hours.sunday
            }));

            // Servicios
            businessConfig.offerings.mainServices.forEach((service, index) => {
                chunks.push(this.formatSection(`Servicio ${index + 1}`, {
                    'Nombre': service.name,
                    'Descripción': service.description,
                    'Rango de Precios': service.priceRange,
                    'Tiempo de Entrega': service.deliveryTime
                }));
            });

            // Valores y Misión
            chunks.push(this.formatSection('Valores y Misión', {
                'Misión': businessConfig.company.mission,
                'Valores': businessConfig.company.values.join(', '),
                'Ventajas Competitivas': businessConfig.company.uniqueSellingPoints.join(', ')
            }));

            // Preguntas Frecuentes
            businessConfig.faq.forEach((faq, index) => {
                chunks.push(this.formatSection(`Pregunta Frecuente ${index + 1}`, {
                    'Pregunta': faq.question,
                    'Respuesta': faq.answer
                }));
            });

            // Políticas
            chunks.push(this.formatSection('Políticas', {
                'Métodos de Pago': businessConfig.policies.payment.methods.join(', '),
                'Términos de Pago': businessConfig.policies.payment.terms,
                'Política de Reembolso': businessConfig.policies.payment.refund,
                'Canales de Soporte': businessConfig.policies.support.channels.join(', '),
                'Tiempo de Respuesta': businessConfig.policies.support.responseTime
            }));

            // Configurar el divisor de texto para español
            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 500,
                chunkOverlap: 50,
                separators: ["\n\n", "\n", ". ", ", ", " ", ""], // Ajustado para español
                keepSeparator: true
            });

            const documents = await textSplitter.createDocuments(chunks);

            // Clear existing documents
            await supabase
                .from('documents')
                .delete()
                .neq('id', 0);

            // Store new documents
            await this.vectorStore.addDocuments(documents);
            console.log(`Se ingresaron correctamente ${documents.length} fragmentos de información`);
        } catch (error) {
            console.error('Error al ingestar la información del negocio:', error);
            throw error;
        }
    }

    formatSection(titulo, campos) {
        return `${titulo}\n${Object.entries(campos)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')}`;
    }

    async ask(messages, systemPrompt) {
        try {
            const lastMessage = Array.isArray(messages) ? 
                messages[messages.length - 1].message : 
                messages;

            // Get relevant documents
            const relevantDocs = await this.vectorStore.similaritySearch(lastMessage, 4);
            const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
            console.log('Contexto relevante:', context);
            // Enhanced Spanish system prompt
            const enhancedSystemPrompt = `${systemPrompt}\n\nContexto relevante:\n${context}\n\nPor favor, proporciona una respuesta clara y concisa en español, utilizando el contexto proporcionado cuando sea relevante.`;

            const formattedMessages = Array.isArray(messages) ? 
                messages.map(msg => ({
                    role: msg.sender === "ChatGPT" ? "assistant" : "user",
                    content: msg.message
                })) : 
                [{ role: "user", content: messages }];

            formattedMessages.unshift({
                role: "system",
                content: enhancedSystemPrompt
            });

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: formattedMessages
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error en la solicitud de ChatGPT:', error);
            throw error;
        }
    }

    async formatInput(input, desiredFormat) {
        if (!input) return null;
        
        try {
            const message = {
                message: input,
                sender: "user"
            };
            
            const prompt = `Formatea el siguiente mensaje al formato deseado: ${desiredFormat}.\nMensaje:`;
            const response = await this.ask([message], prompt);
            return response.trim();
        } catch (error) {
            console.error('Error formatting input:', error);
            return input; // Return original input on error
        }
    }

    async classifyMessage(message) {
        try {
            const response = await this.ask([message], "Classify if this message indicates scheduling intent. Reply only with 'PROGRAMAR' or 'HABLAR'.");
            return response.trim();
        } catch (error) {
            console.error('Error classifying message:', error);
            return 'HABLAR'; // Default to conversation mode on error
        }
    }
}
