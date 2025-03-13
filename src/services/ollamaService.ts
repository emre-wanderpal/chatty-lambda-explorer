
interface OllamaRequestOptions {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
  };
  context?: number[];
  images?: string[];
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  context?: number[];
  done: boolean;
}

export class OllamaService {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = "http://localhost:11434", model: string = "llama3.2-vision") {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generateResponse(prompt: string, images: string[] = []): Promise<{response: string, context?: number[]}> {
    const requestOptions: OllamaRequestOptions = {
      model: this.model,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
      }
    };

    if (images && images.length > 0) {
      requestOptions.images = images;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestOptions),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get response from Ollama: ${errorText}`);
      }

      const data = await response.json() as OllamaResponse;
      return {
        response: data.response,
        context: data.context
      };
    } catch (error) {
      console.error("Error generating response from Ollama:", error);
      throw error;
    }
  }

  async generateStreamResponse(
    prompt: string, 
    images: string[] = [],
    onChunk: (chunk: string) => void,
    onComplete: (fullResponse: string, context?: number[]) => void,
    context?: number[]
  ): Promise<void> {
    // Adding specific instructions to the prompt for formatting and LaTeX support
    const enhancedPrompt = `${prompt}\n\nPlease format your response using markdown. Use **bold** for emphasis, - for bullet points, 1. for numbered lists, # for headings. If there are any scientific concepts, use $formula$ for inline math and $$formula$$ for block equations. Use \`code\` for inline code and \`\`\` for code blocks.`;
    
    const requestOptions: OllamaRequestOptions = {
      model: this.model,
      prompt: enhancedPrompt,
      stream: true,
      options: {
        temperature: 0.7,
      }
    };

    if (images && images.length > 0) {
      requestOptions.images = images;
    }

    if (context) {
      requestOptions.context = context;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestOptions),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get response from Ollama: ${errorText}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let responseContext: number[] | undefined;
      let buffer = "";

      // Read the stream one chunk at a time
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(line => line.trim() !== "");
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line) as OllamaResponse;
            const responseChunk = data.response;
            
            // For real-time character-by-character streaming
            // Send each character directly to the UI for immediate rendering
            fullResponse += responseChunk;
            
            // Send the chunk immediately to the UI - character by character
            // This ensures a more natural typing effect
            onChunk(responseChunk);
            
            if (data.done && data.context) {
              responseContext = data.context;
            }
          } catch (e) {
            console.error("Error parsing JSON:", e, line);
          }
        }
      }

      onComplete(fullResponse, responseContext);
    } catch (error) {
      console.error("Error streaming response from Ollama:", error);
      throw error;
    }
  }
}

export const ollamaService = new OllamaService();
