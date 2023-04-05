import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { ChatGPTMessage } from "../utils/types";
import { ChatLine, LoadingChatLine } from "./ChatLine";
import InputMessage from "./InputMessage";

const COOKIE_NAME = "ai-assistant-bot-user";
const MAX_MESSAGES = 100; // remember the last 100 messages
const HELPER_TEXT = (
  <span>
    Send <strong>ring ring</strong> to start the negotiation.
  </span>
);

export const initialMessages: ChatGPTMessage[] = [
  {
    role: "assistant",
    content:
      "Scenario:\nI'm a bank robber you're the negotiator. I'm in the bank with hostages. Your goal is to get the hostages out. \n\nRules:\n1. You can't give me transportation\n2. You can't give weapons\n3. You can't do a hostage exchange. (No one comes in, people only come out.)\n\nWe simulate being over the phone. When you are ready to go, you say 'ring ring' and we start.",
  },
];

export function Chat({ scrollToBottom }: any) {
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
      <div className="rounded-2xl border-stone-100 p-4 pb-20 pt-20">
        {messages.map(({ content, role }, index) => (
          <ChatLine key={index} role={role} content={content} />
        ))}

        {loading && <LoadingChatLine />}

        <div className="ml-4 w-full text-xs clear-both relative md:bottom-6 md:left-2 text-zinc-500">
          {messages.length < 2 && HELPER_TEXT}
        </div>
      </div>

      <InputMessage
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        scrollToBottom={scrollToBottom}
      />
    </div>
  );
}
