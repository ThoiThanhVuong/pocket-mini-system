export interface IAiTool {
  name: string;
  description: string;
  parameters: any;
}

export interface IAiResponse {
  message: string;
  functionCall?: {
    name: string;
    args: any;
  };
}

export const IAiProviderKey = 'IAiProvider';

export interface IAiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface IAiProvider {
  ask(question: string, history?: IAiMessage[]): Promise<string>;
  askWithContext(context: string, question: string, history?: IAiMessage[]): Promise<string>;
  askWithTools(question: string, tools: IAiTool[], history?: IAiMessage[], systemContext?: string): Promise<IAiResponse>;
}
