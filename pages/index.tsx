import { Chat } from "../components/Chat";

let isScrolling = false;

function scrollToBottom() {
  if (isScrolling) {
    return;
  }
  isScrolling = true;
  const element = document.body;
  const isMobile = window.innerWidth < 768;
  element.scrollIntoView({ behavior: "smooth", block: "end" });
  setTimeout(
    () => {
      isScrolling = false;
    },
    isMobile ? 100 : 190
  );
}

function Home() {
  return (
    <div className="">
      <Chat scrollToBottom={scrollToBottom} />
    </div>
  );
}

export default Home;
