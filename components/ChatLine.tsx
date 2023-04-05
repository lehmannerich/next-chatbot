import { ChatGPTMessage } from "@/utils/types";
import clsx from "clsx";
const ASSISTANT_NAME = "Bank Robber";

export const LoadingChatLine = () => (
  <div className="flex min-w-full animate-pulse py-4 px-3">
    <div className="flex flex-col gap-2 w-full">
      <p className="text-zinc-500 font-medium text-xs">Assistant typing...</p>
      {[...Array(3)].map((_, i) => (
        <p key={i} className="w-full h-2 bg-slate-100 animate-pulse rounded-full"></p>
      ))}
    </div>
  </div>
);

export function ChatLine({ role, content }: ChatGPTMessage) {
  if (!content) {
    return null;
  }

  return (
    <div
      className={role != "assistant" ? "float-right clear-both" : "float-left clear-both"}
    >
      <div className="mb-7 md:mb-12 rounded-lg bg-white px-4 py-4 shadow-lg ring-1 ring-zinc-200 whitespace-pre-wrap">
        <p className="text-zinc-500 font-medium mb-1 text-xs">
          {role == "assistant" ? ASSISTANT_NAME : "You"}
        </p>
        <p className={clsx("text ", role == "assistant" ? "" : "")}>{content}</p>
      </div>
    </div>
  );
}
