import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { ChatLine, LoadingChatLine, type ChatGPTMessage } from "./ChatLine";
import InputMessage from "./InputMessage";

const COOKIE_NAME = "ai-assistant-bot-user";
const MAX_MESSAGES = 100; // remember the last 100 messages

// default first message to display in UI (not necessary to define the prompt)
export const initialMessages: ChatGPTMessage[] = [
  {
    role: "assistant",
    content: "Hi! I am a friendly AI assistant. Ask me anything!",
  },
];

export function Chat({ scrollToBottom }: { scrollToBottom: () => void }) {
  const [messages, setMessages] = useState<ChatGPTMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cookie, setCookie] = useCookies([COOKIE_NAME]);

  useEffect(() => {
    if (!cookie[COOKIE_NAME]) {
      // generate a semi random short id
      const randomId = Math.random().toString(36).substring(7);
      setCookie(COOKIE_NAME, randomId);
    }
  }, [cookie, setCookie]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // send message to API /api/chat endpoint
  const sendMessage = async (message: string) => {
    setLoading(true);
    const newMessages = [
      ...messages,
      { role: "user", content: message } as ChatGPTMessage,
    ];
    setMessages(newMessages);

    const lastMessages = newMessages.slice(-MAX_MESSAGES);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: lastMessages,
        user: cookie[COOKIE_NAME],
      }),
    });

    console.log("Edge function returned.");

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    let lastMessage = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      lastMessage = lastMessage + chunkValue;

      setMessages([
        ...newMessages,
        { role: "assistant", content: lastMessage } as ChatGPTMessage,
      ]);

      setLoading(false);
    }
  };

  return (
    <div className={`max-w-[720px]  mx-auto`}>
      <div className="rounded-2xl border-stone-100 p-4 pb-16 md:pt-14">
        {messages.map(({ content, role }, index) => (
          <ChatLine key={index} role={role} content={content} />
        ))}

        {loading && <LoadingChatLine />}

        <div className="ml-4 w-full text-xs clear-both relative md:bottom-6 md:left-2 text-zinc-500">
          {messages.length < 2 && "Send a message to start the conversation."}
        </div>
      </div>

      <InputMessage input={input} setInput={setInput} sendMessage={sendMessage} />
    </div>
  );
}
