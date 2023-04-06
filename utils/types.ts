export type Message = {
    role: ChatGPTAgent;
    content: string;
  };

export type ChatGPTAgent = "user" | "system" | "assistant";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

// export const MODEL: string = "gpt-3.5-turbo";
export const MODEL: string = "gpt-4";
