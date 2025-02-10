type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type ChatCompletionResponse = {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
};

type CompletionResponse = {
  choices: Array<{
    text: string;
  }>;
};

const FEATHERLESS_API_KEY = import.meta.env.VITE_FEATHERLESS_API_KEY;
const BASE_URL = 'https://api.featherless.ai/v1';

export async function chatCompletion(messages: ChatMessage[], model: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FEATHERLESS_API_KEY}`,
        'X-Title': 'Chess Arena'
      },
      body: JSON.stringify({
        model: model,
        messages,
        max_tokens: 4000
      })

    });


    const data: ChatCompletionResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Chat completion error:', error);
    throw error;
  }
}

export async function textCompletion(prompt: string, model: string, maxTokens: number = 4000): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FEATHERLESS_API_KEY}`,
        'X-Title': 'Chess Arena'
      },
      body: JSON.stringify({
        model: model,
        prompt,
        max_tokens: maxTokens
      })

    });

    const data: CompletionResponse = await response.json();
    return data.choices[0].text;
  } catch (error) {
    console.error('Text completion error:', error);
    throw error;
  }
} 


type Model = {
    id: string;
    is_gated: boolean;
    created: number;
    model_class: string;
    owned_by: string;
    context_length: number;
    max_completion_tokens: number;
    available_on_current_plan: boolean;
  };
  
  export async function fetchModels(): Promise<Model[]> {
    try {
      const response = await fetch(`${BASE_URL}/models`, {
        headers: {
          'Authorization': `Bearer ${FEATHERLESS_API_KEY}`
        }
      });
  
      const data = await response.json();  
      // If data is an array, use it directly; otherwise, try to access data.models
      const models = Array.isArray(data.data) ? data.data : data.data || [];
      
      // Filter for available models only
      return models
        .filter((model: Model) => model.available_on_current_plan)
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  }