import { Chat } from "../components/Chat";

let isScrolling = false;

function scrollToBottom() {
  if (isScrolling) {
    return;
  }
  isScrolling = true;
  const element = document.body;
  element.scrollIntoView({ behavior: "smooth", block: "end" });
  setTimeout(() => {
    isScrolling = false;
  }, 190);
}

function Home() {
  return (
    <div className="bg-amber-50">
      <Chat scrollToBottom={scrollToBottom} />
    </div>
  );
}

export default Home;
