// ChatGPTService.js
export class ChatGPTService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async ask(messages, systemPrompt) {
    try {
      // Ensure messages is always an array
      const messageArray = Array.isArray(messages) ? messages : [{ message: messages, sender: "user" }];

      const formattedMessages = messageArray.map(msg => ({
        role: msg.sender === "ChatGPT" ? "assistant" : "user",
        content: msg.message
      }));

      // Add system message at the beginning
      formattedMessages.unshift({
        role: "system",
        content: systemPrompt
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
      console.error('Error in ChatGPT request:', error);
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
