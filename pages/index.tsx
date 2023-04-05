import { Chat } from "../components/Chat";
import { Navbar } from "../components/Navbar";

let isScrolling: boolean = false;

function scrollToBottom(): void {
  if (isScrolling) {
    return;
  }
  isScrolling = true;
  const element: HTMLElement = document.body;
  element.scrollIntoView({ behavior: "auto", block: "end" });
  isScrolling = false;
}

function debounce(func: Function, wait: number): Function {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedScrollToBottom = debounce(scrollToBottom, 60);

function Home() {
  return (
    <div className="">
      <Navbar />
      <Chat scrollToBottom={debouncedScrollToBottom} />
    </div>
  );
}

export default Home;
