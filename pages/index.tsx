import { Chat } from "../components/Chat";
import { Navbar } from "../components/Navbar";

let isScrolling = false;

function scrollToBottom() {
  if (isScrolling) {
    return;
  }
  isScrolling = true;
  const isMobile = window.innerWidth < 768;
  const element = document.body;
  element.scrollIntoView({ behavior: isMobile ? "auto" : "smooth", block: "end" });
  setTimeout(
    () => {
      isScrolling = false;
    },
    isMobile ? 190 : 190
  );
}

function Home() {
  return (
    <div className="">
      <Navbar />
      <Chat scrollToBottom={scrollToBottom} />
    </div>
  );
}

export default Home;
