// LLM Client for Ollama integration
export interface LLMResponse {
  content: string;
  done: boolean;
}

export class OllamaClient {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'mistral:7b-instruct-q4_0') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async *generateStream(
    messages: Array<{ role: string; content: string }>,
    signal?: AbortSignal
  ): AsyncGenerator<LLMResponse> {
    try {
      const formattedMessages = messages.map(msg => ({
        ...msg,
        content: msg.role === 'user' ? this.formatBoldText(msg.content) : msg.content
      }));
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: formattedMessages,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last line in buffer if it's incomplete
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.message?.content) {
                yield {
                  content: this.removeBoldMarkers(data.message.content),
                  done: data.done || false,
                };
              }
              // Always yield if done, even if no content
              if (data.done) {
                yield {
                  content: '',
                  done: true,
                };
                return;
              }
            } catch (error) {
              console.warn('Failed to parse JSON:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in generateStream:', error);
      // Fallback to mock response for development
      yield* this.mockStreamResponse(messages);
    }
  }
  private removeBoldMarkers(text: string): string {
    return text.replace(/\*\*/g, '');
  }
  private formatBoldText(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  }
  // Mock response for development/demo purposes
  private async *mockStreamResponse(
    messages: Array<{ role: string; content: string }>
  ): AsyncGenerator<LLMResponse> {
    const userMessage = messages[messages.length - 1]?.content || '';
    const responses = [
      "I understand you're asking about: ",
      `"${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}"`,
      "\n\nThis is a mock response since we're not connected to a real Ollama instance. ",
      "In a production environment, this would be replaced with actual responses from ",
      "the gemma:1b model running on Ollama.\n\n",
      "The application is fully structured to work with real Ollama integration - ",
      "you just need to ensure Ollama is running locally with the gemma:1b model loaded.",
    ];

    for (const chunk of responses) {
      yield {
        content: this.removeBoldMarkers(chunk),
        done: false,
      };
      // Simulate realistic streaming delay
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    }

    yield {
      content: '',
      done: true,
    };
  }

  async checkConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let clientInstance: OllamaClient | null = null;

export function getLLMClient(): OllamaClient {
  if (!clientInstance) {
    clientInstance = new OllamaClient();
  }
  return clientInstance;
}