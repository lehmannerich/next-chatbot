import { Button } from "./Button";

export default function InputMessage({
  input,
  setInput,
  sendMessage,
  scrollToBottom,
}: any) {
  return (
    <div className="px-4 fixed bottom-0 w-full bg-stone-100 pt-4 md:pt-0 md:bg-white max-w-[720px] mx-auto md:bg-transparent">
      <div className="flex clear-both md:shadow-lg md:shadow-white">
        <input
          type="text"
          aria-label="chat input"
          placeholder="Send a message..."
          className="md:text-lg py-2 md:py-3 min-w-0 flex-auto appearance-none rounded border border-stone-300 px-3 md:shadow-lg shadow-stone-800/5 placeholder:text-stone-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
          value={input}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // if on mobile, blur the input to hide the keyboard
              if (window.innerWidth < 768) {
                e.currentTarget.blur();
              }
              sendMessage(input);
              setInput("");
            }
          }}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onFocus={() => {
            if (window.innerWidth < 768) {
              // wait for a second to allow the keyboard to show
              setTimeout(() => {
                scrollToBottom();
              }, 1000);
            }
          }}
        />
        <Button
          type="submit"
          className="ml-1 flex-none"
          onClick={() => {
            sendMessage(input);
            setInput("");
          }}
        >
          Send
        </Button>
      </div>
      <div className="h-8"></div>
    </div>
  );
}
