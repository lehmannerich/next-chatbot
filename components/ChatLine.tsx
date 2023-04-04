import clsx from "clsx";

type ChatGPTAgent = "user" | "system" | "assistant";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

// loading placeholder animation for the chat line
export const LoadingChatLine = () => (
  <div className="flex min-w-full animate-pulse px-4 py-5 sm:px-6">
    <p className="text-zinc-500 font-medium text-xs">Assistant typing...</p>
  </div>
);

export function ChatLine({ role = "assistant", content }: ChatGPTMessage) {
  if (!content) {
    return null;
  }
  const formattedMessage = content;

  return (
    <div
      className={role != "assistant" ? "float-right clear-both" : "float-left clear-both"}
    >
      <div className="mb-5 md:mb-12 rounded-lg bg-white px-4 md:px-6 py-4 shadow-lg ring-1 ring-zinc-200 whitespace-pre-wrap">
        <p className="text-zinc-500 font-medium mb-1 text-xs">
          {role == "assistant" ? "Assistant" : "You"}
        </p>
        <p className={clsx("text ", role == "assistant" ? "" : "")}>{formattedMessage}</p>
      </div>
    </div>
  );
}
