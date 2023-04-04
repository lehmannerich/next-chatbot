import { Answer } from "@/components/Answer/Answer";
import Bookslibrary from "@/components/Bookslibrary";
import Bookslider from "@/components/Bookslider";
import { PGChunk } from "@/types";
import { IconArrowRight, IconExternalLink, IconSearch } from "@tabler/icons-react";
import endent from "endent";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

interface Book {
  name: string;
  author: string;
  table_key: string;
  url: string;
}

export default function Home() {

  const books = [
    {
      name: "PG Essays",
      author: "Paul Graham",
      table_key: "PG-essays",
      url: "http://www.paulgraham.com/articles.html",
      cover: "/pg.png"
    },
    {
      name: "Wait But Why",
      author: "Tim Urban",
      table_key: "WBW-posts",
      url: "https://waitbutwhy.com/homepage",
      cover: "https://place-hold.it/144x192"
    },
    {
      name: "Our World in Data",
      author: "Max Roser",
      table_key: "ourworldindata",
      url: "https://ourworldindata.org/",
      cover: "https://place-hold.it/144x192"
    },
    {
      name: "Bundesamt für Statistik",
      author: "Destatis",
      table_key: "destatis",
      url: "https://www.destatis.de/DE/Home/_inhalt.html",
      cover: "https://place-hold.it/144x192"
    },
    {
      name: "Neues Testament",
      author: "Lutherbibel 2017",
      table_key: "new-testament",
      url: "https://www.die-bibel.de/bibeln/online-bibeln/lesen/LU17/GEN.1/1.-Mose-1",
      cover: "/neues.png"
    },
    {
      name: "Altes Testament",
      author: "Lutherbibel 2017",
      table_key: "old-testament",
      url: "https://www.die-bibel.de/bibeln/online-bibeln/lesen/LU17/GEN.1/1.-Mose-1",
      cover: "/altes.png"
    },
    {
      name: "Search All",
      author: "All Books & Essays",
      table_key: "",
      url: "",
      cover: "https://place-hold.it/144x192"
    },
  ];

  const [selected, setSelected] = useState<Book>(books[books.length - 1]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string>("");
  const [chunks, setChunks] = useState<PGChunk[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [matchCount, setMatchCount] = useState<number>(4);

  const handleAnswer = async () => {
    if (!query) {
      alert("Please enter a query.");
      return;
    }

    setAnswer("");
    setChunks([]);
    setLoading(true);

    const searchResponse = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, matches: matchCount, table_key: selected.table_key })
    });

    if (!searchResponse.ok) {
      setLoading(false);
      throw new Error(searchResponse.statusText);
    }

    const results: PGChunk[] = await searchResponse.json();

    setChunks(results);

    const prompt = endent`
    Use the following passages to provide an answer to the query. Respond IN THE SAME LANGUAGE AS THE QUERY: ${query}

    ${results?.map((d: any) => d.content).join("\n\n")}
    `;

    const answerResponse = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    if (!answerResponse.ok) {
      setLoading(false);
      throw new Error(answerResponse.statusText);
    }

    const data = answerResponse.body;

    if (!data) {
      return;
    }

    setLoading(false);

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setAnswer((prev) => prev + chunkValue);
    }

    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
        handleAnswer();
    }
  };

  useEffect(() => {
    if (matchCount > 10) {
      setMatchCount(10);
    } else if (matchCount < 1) {
      setMatchCount(1);
    }
  }, [matchCount]);

  return (
    <>
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-auto">
          <div className="mx-auto flex h-full w-full max-w-[750px] flex-col items-center px-3 pt-4 sm:pt-8">
          <Bookslibrary books={books} selected={selected} setSelected={setSelected}></Bookslibrary>

              <div className="relative w-full mt-4">
                <IconSearch className="absolute top-3 w-10 left-1 h-6 rounded-full opacity-50 sm:left-3 sm:top-4 sm:h-8" />
                <input
                  ref={inputRef}
                  className="h-12 w-full rounded border border-zinc-600 pr-12 pl-11 focus:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800 sm:h-16 sm:py-2 sm:pr-16 sm:pl-16 sm:text-lg"
                  type="text"
                  placeholder="Ask me anything!"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <button>
                  <IconArrowRight
                    onClick={handleAnswer}
                    className="absolute right-2 top-2.5 h-7 w-7 rounded bg-blue-500 p-1 hover:cursor-pointer hover:bg-blue-600 sm:right-3 sm:top-3 sm:h-10 sm:w-10 text-white"
                  />
                </button>
              </div>
              <Bookslider books={books} selected={selected} setSelected={setSelected}></Bookslider>


            {loading ? (
              <div className="mt-6 w-full">

                  <div>
                    <div className="font-bold text-2xl">Answer</div>
                    <div className="animate-pulse mt-2">
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded mt-2"></div>
                      <div className="h-4 bg-gray-300 rounded mt-2"></div>
                      <div className="h-4 bg-gray-300 rounded mt-2"></div>
                      <div className="h-4 bg-gray-300 rounded mt-2"></div>
                    </div>
                  </div>


                <div className="font-bold text-2xl mt-6">Passages</div>
                <div className="animate-pulse mt-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 bg-gray-300 rounded mt-2"></div>
                </div>
              </div>
            ) : answer ? (
              <div className="mt-6">
                <div className="font-bold text-2xl mb-2">Answer</div>
                <Answer text={answer} />

                <div className="mt-6 mb-16">
                  <div className="font-bold text-2xl">Passages</div>

                  {chunks.map((chunk, index) => (
                    <div key={index}>
                      <div className="mt-4 border border-zinc-600 rounded-lg p-4">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-bold text-xl">{chunk.essay_title}</div>
                            <div className="mt-1 font-bold text-sm">{chunk.essay_date}</div>
                          </div>
                          <a
                            className="hover:opacity-50 ml-2"
                            href={chunk.essay_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <IconExternalLink />
                          </a>
                        </div>
                        <div className="mt-2">{chunk.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : chunks.length > 0 ? (
              <div className="mt-6 pb-16">
                <div className="font-bold text-2xl">Passages</div>
                {chunks.map((chunk, index) => (
                  <div key={index}>
                    <div className="mt-4 border border-zinc-600 rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-bold text-xl">{chunk.essay_title}</div>
                          <div className="mt-1 font-bold text-sm">{chunk.essay_date}</div>
                        </div>
                        <a
                          className="hover:opacity-50 ml-2"
                          href={chunk.essay_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <IconExternalLink />
                        </a>
                      </div>
                      <div className="mt-2">{chunk.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 text-center text-lg invisible">AI-powered search for books & blogs.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
