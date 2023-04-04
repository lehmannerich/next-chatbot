import { PGChunk, PGEssay, PGJSON } from "@/types";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { encode } from "gpt-3-encoder";

const BASE_URL = "https://www.die-bibel.de/bibeln/online-bibeln/lesen/LU17/";
const CHUNK_SIZE = 300;


const getLinks = async () => {
  const linksArr: { url: string; title: string, date: string; }[] = [];

  const template: { path1: string; path2: string; start: number; end: number }[] = [
    // OLD TESTAMENT
    { path1: "GEN.", path2:"/1.Mose-", start: 1, end: 50 },
    { path1: "EXO.", path2:"/2.Mose-", start: 1, end: 40 },
    { path1: "LEV.", path2:"/3.Mose-", start: 1, end: 27 },
    { path1: "NUM.", path2:"/4.Mose-", start: 1, end: 36 },
    { path1: "DEU.", path2:"/5.Mose-", start: 1, end: 34 },
    { path1: "JOS.", path2:"/Josua-", start: 1, end: 24 },
    { path1: "JDG.", path2:"/Richter-", start: 1, end: 21 },
    { path1: "RUT.", path2:"/Rut-", start: 1, end: 4 },
    { path1: "1SA.", path2:"/1.-Samuel-", start: 1, end: 31 },
    { path1: "2SA.", path2:"/2.-Samuel-", start: 1, end: 24 },
    { path1: "1KI.", path2:"/1.-Könige-", start: 1, end: 22 },
    { path1: "2KI.", path2:"/2.-Könige-", start: 1, end: 25 },
    { path1: "1CH.", path2:"/1.-Chronik-", start: 1, end: 29 },
    { path1: "2CH.", path2:"/2.-Chronik-", start: 1, end: 36 },
    { path1: "EZR.", path2:"/Esra-", start: 1, end: 10 },
    { path1: "NEH.", path2:"/Nehemia-", start: 1, end: 12 },
    { path1: "EST.", path2:"/Ester-", start: 1, end: 10 },
    { path1: "JOB.", path2:"/Hiob-", start: 1, end: 42 },
    { path1: "PSA.", path2:"/Psalm-", start: 1, end: 150 },
    { path1: "PRO.", path2:"/Sprüche-", start: 1, end: 31 },
    { path1: "ECC.", path2:"/Prediger-", start: 1, end: 12 },
    { path1: "SNG.", path2:"/Hoheslied-", start: 1, end: 8 },
    { path1: "ISA.", path2:"/Jesaja-", start: 1, end: 66 },
    { path1: "JER.", path2:"/Jeremia-", start: 1, end: 52 },
    { path1: "LAM.", path2:"/Klagelieder-", start: 1, end: 5 },
    { path1: "EZK.", path2:"/Hesekiel-", start: 1, end: 48 },
    { path1: "DAN.", path2:"/Daniel-", start: 1, end: 12 },
    { path1: "HOS.", path2:"/Hosea-", start: 1, end: 14 },
    { path1: "JOL.", path2:"/Joel-", start: 1, end: 4 },
    { path1: "AMO.", path2:"/Amos-", start: 1, end: 9 },
    { path1: "OBA.", path2:"/Obadja-", start: 1, end: 1 },
    { path1: "JON.", path2:"/Jona-", start: 1, end: 4 },
    { path1: "MIC.", path2:"/Micha-", start: 1, end: 7 },
    { path1: "NAM.", path2:"/Nahum-", start: 1, end: 3 },
    { path1: "HAB.", path2:"/Habakuk-", start: 1, end: 3 },
    { path1: "ZEP.", path2:"/Zefanja-", start: 1, end: 3 },
    { path1: "HAG.", path2:"/Haggai-", start: 1, end: 2 },
    { path1: "ZEC.", path2:"/Sacharja-", start: 1, end: 14 },
    { path1: "MAL.", path2:"/Maleachi-", start: 1, end: 3 },

    // NEW TESTAMENT
    // { path1: "MAT.", path2:"/Matthäus-", start: 1, end: 28 },
    // { path1: "MRK.", path2:"/Markus-", start: 1, end: 16 },
    // { path1: "LUK.", path2:"/Lukas-", start: 1, end: 24 },
    // { path1: "JHN.", path2:"/Johannes-", start: 1, end: 21 },
    // { path1: "ACT.", path2:"/Apostelgeschichte-", start: 1, end: 28 },
    // { path1: "ROM.", path2:"/Römer-", start: 1, end: 16 },
    // { path1: "1CO.", path2:"/1.-Korinther-", start: 1, end: 16 },
    // { path1: "2CO.", path2:"/2.-Korinther-", start: 1, end: 13 },
    // { path1: "GAL.", path2:"/Galater-", start: 1, end: 6 },
    // { path1: "EPH.", path2:"/Epheser-", start: 1, end: 6 },
    // { path1: "PHP.", path2:"/Philipper-", start: 1, end: 4 },
    // { path1: "COL.", path2:"/Kolosser-", start: 1, end: 4 },
    // { path1: "1TH.", path2:"/1.-Thessalonicher-", start: 1, end: 5 },
    // { path1: "2TH.", path2:"/2.-Thessalonicher-", start: 1, end: 3 },
    // { path1: "1TI.", path2:"/1.-Timothyus-", start: 1, end: 6 },
    // { path1: "2TI.", path2:"/2.-Timothyus-", start: 1, end: 4 },
    // { path1: "TIT.", path2:"/Titus-", start: 1, end: 3 },
    // { path1: "PHM.", path2:"/Philemon-", start: 1, end: 1 },
    // { path1: "1PE.", path2:"/1.-Petrus-", start: 1, end: 5 },
    // { path1: "2PE.", path2:"/2.-Petrus-", start: 1, end: 3 },
    // { path1: "1JN.", path2:"/1.-Johannes-", start: 1, end: 5 },
    // { path1: "2JN.", path2:"/2.-Johannes-", start: 1, end: 1 },
    // { path1: "3JN.", path2:"/3.-Johannes-", start: 1, end: 1 },
    // { path1: "HEB.", path2:"/Hebräer-", start: 1, end: 13 },
    // { path1: "JAS.", path2:"/Jakobus-", start: 1, end: 5 },
    // { path1: "JUD.", path2:"/Judas-", start: 1, end: 1 },
    // { path1: "REV.", path2:"/Offenbarung-", start: 1, end: 22 },

    // APO
    // { path1: "JDT.", path2:"/Judit-", start: 1, end: 16 },
    // { path1: "WIS.", path2:"/Weisheit-", start: 1, end: 19 },
    // { path1: "TOB.", path2:"/Tobit-", start: 1, end: 14 },
    // { path1: "SIR.", path2:"/Sirach-", start: 1, end: 14 },
    // { path1: "BAR.", path2:"/Baruch-", start: 1, end: 14 },
    // { path1: "1MA.", path2:"/1.-Makkabäer-", start: 1, end: 16 },
    // { path1: "2MA.", path2:"/2.-Makkabäer-", start: 1, end: 15 },

  ]

  for (let i = 0; i < template.length; i++) {
    const { path1, path2, start, end } = template[i];
    for (let n = start; n <= end; n++) {
      const html = await axios.get(`${BASE_URL}${path1}${n}${path2}${n}`);
      const $ = cheerio.load(html.data);

      let title = '';
      $("h3").each((index, element) => {
        if (index > 0) {
          title += ' | ';
        }
        title += $(element).text().trim();
      });

      const url = `${path1}${n}${path2}${n}`;
      // date is path2 but first and last char are removed
      const date = path2.slice(1, -1);
      const linkObj = {
        url,
        title,
        date
      };
      console.log(BASE_URL + linkObj.url);
      console.log(linkObj.title);
      console.log("");

      linksArr.push(linkObj);
    }
  }

  return linksArr;
};

function parseVerseText($: any): string[] {
  const verseTexts: string[] = [];

  // Remove unwanted elements before looping through span.verse.part elements
  $('i').remove();
  $('.no-text-indent').remove();

  $('span.verse.part').each((index: number, element: cheerio.Element) => {
    verseTexts.push($(element).text());
  });

  return verseTexts;
}



const getEssay = async (linkObj: { url: string; title: string; date: string; }) => {
  const { title, url, date } = linkObj;

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

  const verseTexts: string[] = parseVerseText($);
  const combinedVerseText: string = verseTexts.join(' ');
  const cleanedVerseText: string = combinedVerseText.replace(/\s{2,}/g, ' ');

      if (!cleanedVerseText) {
        console.log("No text found for " + fullLink);
        return essay;
      }

      essay = {
        author_name: "old-testament",
        title,
        url: fullLink,
        date: date,
        thanks: "",
        content: cleanedVerseText,
        length: cleanedVerseText.length,
        tokens: encode(cleanedVerseText).length,
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
      author_name: "old-testament",
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

  // save links to file
  fs.writeFileSync("scripts/old-testament-links.json", JSON.stringify(links));

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

  fs.writeFileSync("scripts/old-testament.json", JSON.stringify(json));
})();
