import { PGChunk, PGEssay, PGJSON } from "@/types";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { encode } from "gpt-3-encoder";

const BASE_URL = "https://ourworldindata.org/";
const CHUNK_SIZE = 350;


const getLinks = async () => {

  const linksArr: { url: string; title: string, date: string; }[] = [];

  const template: { path1: string; start: number; end: number }[] = [
    { path1: "blog/page/", start: 1, end: 16 }
  ]

    for (let i = 0; i < template.length; i++) {
    const { path1, start, end } = template[i];
    for (let n = start; n <= end; n++) {
      let html: {data: string} = { data: ""};
      if (n === 1) {
        html = await axios.get(`${BASE_URL}blog/`);
      }
      else {
        html = await axios.get(`${BASE_URL}${path1}${n}`);
      }

      const $ = cheerio.load(html.data);

      // loop through all li element with class "post"
      $('li.post').each((index: number, element: cheerio.Element) => {
        // get the first link href (if there are multiple links ignore them)
        const url = $(element).find('a').first().attr('href');
        // get the first h3 element text
        const title = $(element).find('h3').first().text();
        // get the first <time> element text
        const date = $(element).find('time').first().text();

      const linkObj = {
        url: String(url),
        title,
        date
      };

      console.log(linkObj);

      linksArr.push(linkObj);
      });
    }
  }

  return linksArr;
};


const getEssay = async (linkObj: { url: string; title: string; date: string; }) => {
  const { title, url, date } = linkObj;

  let essay: PGEssay = {
    author_name: "ourworldindata",
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

  // if the id of the <main> element is "ExplorerContainer" then skip this page
  if ($("#ExplorerContainer").length) {
    return essay;
  }

  // get the div with the class "article-content"
  const articleContent = $(".article-content");
  // remove the last div in the section block
  articleContent.find("div").last().remove();
  // get all the <p> elements and put them together in one big string
  const essayText = articleContent.find("p").map((index, element) => {
    return $(element).text();
  }).get().join(" ");

  // clean the text. Remove double spaces, new lines, and trim the text
  const cleanedText = essayText.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s\s+/g, " ").trim();


      essay = {
        author_name: "ourworldindata",
        title,
        url: fullLink,
        date: date,
        thanks: "",
        content: cleanedText,
        length: cleanedText.length,
        tokens: encode(cleanedText).length,
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
      author_name: "ourworldindata",
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

  const GET_FROM_LOCAL_FILE = false;
  let links: { url: string; title: string; date: string; }[] = [];

  if(GET_FROM_LOCAL_FILE) {
    links = JSON.parse(fs.readFileSync("scripts/ourworldindata-links.json", "utf8"));
  } else {
  links = await getLinks();
  fs.writeFileSync("scripts/ourworldindata-links.json", JSON.stringify(links));
  }

  let essays = [];

  for (let i = 0; i < links.length; i++) {
    const essay = await getEssay(links[i]);
    const chunkedEssay = await chunkEssay(essay);
    console.log("Essay " + (i + 1) + " of " + links.length + " done");
    essays.push(chunkedEssay);
  }

  const json: PGJSON = {
    current_date: "2023-03-25",
    author: "Deutsche Bibelgesellschaft",
    url: "https://www.die-bibel.de/",
    length: essays.reduce((acc, essay) => acc + essay.length, 0),
    tokens: essays.reduce((acc, essay) => acc + essay.tokens, 0),
    essays
  };

  fs.writeFileSync("scripts/ourworldindata.json", JSON.stringify(json));
})();
