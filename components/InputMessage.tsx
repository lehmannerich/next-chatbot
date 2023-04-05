import { Button } from "./Button";

export default function InputMessage({
  input,
  setInput,
  sendMessage,
  setViewHeight,
}: any) {
  return (
    <div className="p-2 md:fixed md:bottom-0 w-full bg-stone-100 max-w-[720px] mx-auto md:bg-transparent md:mb-6">
      <div className="flex clear-both md:shadow-lg md:shadow-white">
        <input
          type="text"
          aria-label="chat input"
          placeholder="Send a message..."
          className="md:text-lg py-2 md:py-3 min-w-0 flex-auto appearance-none rounded border border-stone-300 px-3 md:shadow-lg shadow-stone-800/5 placeholder:text-stone-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
          value={input}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage(input);
              setInput("");
              // focus on input
              e.currentTarget.focus();
            }
          }}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onFocus={() => {
            setTimeout(() => {
              setViewHeight(window.innerHeight);
            }, 1000);
          }}
          onBlur={() => {
            setTimeout(() => {
              setViewHeight(window.innerHeight);
            }, 1000);
          }}
        />
        <Button
          type="submit"
          className="ml-1 flex-none"
          onClick={() => {
            sendMessage(input);
            setInput("");
            // focus input
            const inputElement = document.querySelector("input");
            if (inputElement) {
              inputElement.focus();
            }
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
