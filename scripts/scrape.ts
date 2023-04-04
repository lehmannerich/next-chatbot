import { PGChunk, PGEssay, PGJSON } from "@/types";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { encode } from "gpt-3-encoder";

const BASE_URL = "https://www.destatis.de/";
const CHUNK_SIZE = 200;
const RESULT_SITE_START = 1;
const RESULT_SITE_END = 149;


const getLinks = async () => {
  const linksArr: { url: string; title: string }[] = [];

  // push all links into array
  for (let n = RESULT_SITE_START; n <= RESULT_SITE_END; n++) {
    console.log("Getting links from page " + n);
    const html = await axios.get(`${BASE_URL}SiteGlobals/Forms/Suche/Presse/DE/Pressesuche_Formular.html?gtp=250538_list%253D${n}&resultsPerPage=30`);
    const $ = cheerio.load(html.data);
    const results = $(".s-press-search-results").find(".c-result");

    results.each((i, result) => {
        const links = $(result).find("a");
        links.each((i, link) => {
          const url = $(link).attr("href");
          const title = $(link).find(".c-result__date").text().trim();

          if (url && url.endsWith(".html") && url.startsWith("DE/Presse") ) {
            const linkObj = {
              url,
              title
            };
            console.log(url);
            linksArr.push(linkObj);
          }
        });

    });

  }
  return linksArr;
};

const getEssay = async (linkObj: { url: string; title: string }) => {
  const { title, url } = linkObj;

  let essay: PGEssay = {
    author_name: "PG-essays",
    title: "",
    url: "",
    date: "",
    thanks: "",
    content: "",
    length: 0,
    tokens: 0,
    chunks: []
  };

  const fullLink = BASE_URL + url;
  const html = await axios.get(fullLink);
  const $ = cheerio.load(html.data);
  const content = $("#content").remove(".l-content-wrapper").find("p");

      const text = $(content).text();

      if (!text) {
        console.log("No text found for " + fullLink);
        return essay;
      }

      let cleanedText = text.replace(/\s+/g, " ");
      cleanedText = cleanedText.replace(/\.([a-zA-Z])/g, ". $1");


      const inputString = title;
      const match = inputString.match(/\d{1,2}\.\s*[a-zA-ZäöüÄÖÜß]+\s*\d{4}/);
      let dateStr = "";
        if (match) {
          dateStr = match[0];
          console.log(dateStr);
        }
        else {
        console.log("No date found for " + fullLink);
        }
      const date = dateStr;
      let textWithoutDate = "";

      if (date) {
        textWithoutDate = cleanedText.replace(date[0], "");
      }

      let essayText = textWithoutDate.replace(/\n/g, " ");
      let thanksTo = "";

      const split = essayText.split(". ").filter((s) => s);
      const lastSentence = split[split.length - 1];
      if (lastSentence && lastSentence.includes("Thanks to")) {
        const thanksToSplit = lastSentence.split("Thanks to");

        if (thanksToSplit[1].trim()[thanksToSplit[1].trim().length - 1] === ".") {
          thanksTo = "Thanks to " + thanksToSplit[1].trim();
        } else {
          thanksTo = "Thanks to " + thanksToSplit[1].trim() + ".";
        }

        essayText = essayText.replace(thanksTo, "");
      }

      const trimmedContent = essayText.trim();

      essay = {
        author_name: "destatis",
        title,
        url: fullLink,
        date: dateStr,
        thanks: thanksTo.trim(),
        content: trimmedContent,
        length: trimmedContent.length,
        tokens: encode(trimmedContent).length,
        chunks: []
      };



  return essay;
};

const chunkEssay = async (essay: PGEssay) => {
  const { title, url, date, thanks, content, ...chunklessSection } = essay;

  let essayTextChunks = [];

  if (encode(content).length > CHUNK_SIZE) {
    const split = content.split(". ");
    let chunkText = "";

    for (let i = 0; i < split.length; i++) {
      const sentence = split[i];
      const sentenceTokenLength = encode(sentence);
      const chunkTextTokenLength = encode(chunkText).length;

      if (chunkTextTokenLength + sentenceTokenLength.length > CHUNK_SIZE) {
        essayTextChunks.push(chunkText);
        chunkText = "";
      }

      if (!sentence) {
        continue;
      }

      if (sentence[sentence.length - 1].match(/[a-z0-9]/i)) {
        chunkText += sentence + ". ";
      } else {
        chunkText += sentence + " ";
      }
    }

    essayTextChunks.push(chunkText.trim());
  } else {
    essayTextChunks.push(content.trim());
  }

  const essayChunks = essayTextChunks.map((text) => {
    const trimmedText = text.trim();

    const chunk: PGChunk = {
      author_name: "PG-essays",
      essay_title: title,
      essay_url: url,
      essay_date: date,
      essay_thanks: thanks,
      content: trimmedText,
      content_length: trimmedText.length,
      content_tokens: encode(trimmedText).length,
      embedding: []
    };

    return chunk;
  });

  if (essayChunks.length > 1) {
    for (let i = 0; i < essayChunks.length; i++) {
      const chunk = essayChunks[i];
      const prevChunk = essayChunks[i - 1];

      if (chunk.content_tokens < 100 && prevChunk) {
        prevChunk.content += " " + chunk.content;
        prevChunk.content_length += chunk.content_length;
        prevChunk.content_tokens += chunk.content_tokens;
        essayChunks.splice(i, 1);
        i--;
      }
    }
  }

  const chunkedSection: PGEssay = {
    ...essay,
    chunks: essayChunks
  };

  return chunkedSection;
};

(async () => {
  const links = await getLinks();

  // return

  let essays = [];

  for (let i = 0; i < links.length; i++) {
    const essay = await getEssay(links[i]);
    const chunkedEssay = await chunkEssay(essay);
    essays.push(chunkedEssay);
    console.log("Finished essay " + (i + 1) + " of " + links.length);
  }

  const json: PGJSON = {
    current_date: "2023-03-24",
    author: "Statistisches Bundesamt",
    url: "https://www.destatis.de/",
    length: essays.reduce((acc, essay) => acc + essay.length, 0),
    tokens: essays.reduce((acc, essay) => acc + essay.tokens, 0),
    essays
  };

  fs.writeFileSync("scripts/destatis.json", JSON.stringify(json));
})();
