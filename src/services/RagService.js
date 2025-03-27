import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { supabase } from '../supabaseClient';
import { businessConfig } from '../config/business.config';

export class RagService {
    constructor(apiKey) {
        this.embeddings = new OpenAIEmbeddings({
            openAIApiKey: apiKey,
        });
        this.vectorStore = null;
    }

    async initialize() {
        if (!this.vectorStore) {
            this.vectorStore = new SupabaseVectorStore(this.embeddings, {
                client: supabase,
                tableName: 'documents',
                queryName: 'match_documents'
            });
            await this.ingestBusinessInfo();
        }
        return this.vectorStore;
    }

    async ingestBusinessInfo() {
        try {
            const chunks = [];

            // Company Information
            chunks.push({
                text: this.formatSection('Company Information', {
                    'Company Name': businessConfig.business.name,
                    'Industry': businessConfig.business.industry,
                    'Year Founded': businessConfig.business.yearFounded,
                    'Tagline': businessConfig.business.tagline
                }),
                metadata: { type: 'company_info' }
            });

            // Contact Information
            chunks.push({
                text: this.formatSection('Contact Information', {
                    'Address': businessConfig.contact.address,
                    'Phone': businessConfig.contact.phone,
                    'Email': businessConfig.contact.email,
                    'Website': businessConfig.contact.website,
                    'Weekday Hours': businessConfig.contact.hours.weekdays,
                    'Saturday Hours': businessConfig.contact.hours.saturday,
                    'Sunday Hours': businessConfig.contact.hours.sunday
                }),
                metadata: { type: 'contact_info' }
            });

            // Services
            businessConfig.offerings.mainServices.forEach((service, index) => {
                chunks.push({
                    text: this.formatSection(`Service ${index + 1}`, {
                        'Name': service.name,
                        'Description': service.description,
                        'Price Range': service.priceRange,
                        'Delivery Time': service.deliveryTime
                    }),
                    metadata: { type: 'service', serviceId: index }
                });
            });

            // Company Values and Mission
            chunks.push({
                text: this.formatSection('Company Profile', {
                    'Mission': businessConfig.company.mission,
                    'Values': businessConfig.company.values.join(', '),
                    'Unique Selling Points': businessConfig.company.uniqueSellingPoints.join(', ')
                }),
                metadata: { type: 'company_values' }
            });

            // FAQs
            businessConfig.faq.forEach((faq, index) => {
                chunks.push({
                    text: this.formatSection(`FAQ ${index + 1}`, {
                        'Question': faq.question,
                        'Answer': faq.answer
                    }),
                    metadata: { type: 'faq', faqId: index }
                });
            });

            await this.processAndStoreChunks(chunks);
            return true;
        } catch (error) {
            console.error('Error ingesting business information:', error);
            throw error;
        }
    }

    formatSection(title, fields) {
        const content = Object.entries(fields)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        return `${title}\n${content}`;
    }

    async processAndStoreChunks(chunks) {
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50,
            separators: ["\n\n", "\n", " ", ""]
        });

        const documents = await Promise.all(
            chunks.map(async (chunk) => {
                return await textSplitter.createDocuments(
                    [chunk.text],
                    [chunk.metadata]
                );
            })
        );

        const flatDocuments = documents.flat();

        // Clear existing documents
        await supabase
            .from('documents')
            .delete()
            .neq('id', 0);

        // Store new documents
        await this.vectorStore.addDocuments(flatDocuments);
        console.log(`Successfully ingested ${flatDocuments.length} document chunks`);
    }

    async searchSimilarDocuments(query, count = 4) {
        if (!this.vectorStore) {
            await this.initialize();
        }
        return await this.vectorStore.similaritySearch(query, count);
    }
}