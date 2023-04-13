import { useEffect } from "react";
import { Button } from "./Button";

export default function InputMessage({ input, setInput, sendMessage, tokenCount }: any) {
  useEffect(() => {
    // if NOT on mobile, focus the input to show the keyboard
    if (window.innerWidth >= 768) {
      const input = document.querySelector("input");
      if (input) {
        input.focus();
      }
    }
  }, []);

  const isOn = true;

  return (
    <div className="px-4 fixed bottom-0 w-full bg-stone-100 pt-4 md:pt-0 md:bg-white max-w-[720px] mx-auto md:bg-transparent">
      {!isOn ? (
        <div className="flex clear-both md:shadow-lg md:shadow-white bg-rose-50 rounded p-4 text-rose-500 font-mono">
          OpenAI API limit reached: this means the demo does not work anymore.
        </div>
      ) : (
        <>
          <div className="flex clear-both md:shadow-lg md:shadow-white ">
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

          <div className="text-xs mt-2 ml-3 text-zinc-500 font-medium ">
            {tokenCount} token spent with GPT-4 ({" "}
            <a
              href="https://www.buymeacoffee.com/lehmannerich"
              className="underline hover:text-black"
              target="_blanc"
            >
              ~ ${((tokenCount / 1000) * 0.06).toFixed(2)}
            </a>{" "}
            )
          </div>
        </>
      )}
      <div className="h-8"></div>
    </div>
  );
}
