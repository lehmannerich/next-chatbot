export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo"
}

export type PGEssay = {
  author_name: string;
  title: string;
  url: string;
  date: string;
  thanks: string;
  content: string;
  length: number;
  tokens: number;
  chunks: PGChunk[];
};

export type WBWPost = {
  title: string;
  url: string;
  date: string;
  type: string;
  content: string;
  length: number;
  tokens: number;
  chunks: WBWChunck[];
};

export type PGChunk = {
  author_name: string;
  essay_title: string;
  essay_url: string;
  essay_date: string;
  essay_thanks: string;
  content: string;
  content_length: number;
  content_tokens: number;
  embedding: number[];
};

export type WBWChunck = {
  post_title: string;
  post_url: string;
  post_date: string;
  post_type: string;
  content: string;
  content_length: number;
  content_tokens: number;
  embedding: number[];
};

export type PGJSON = {
  current_date: string;
  author: string;
  url: string;
  length: number;
  tokens: number;
  essays: PGEssay[];
};

export type WBWJSON = {
  current_date: string;
  author: string;
  url: string;
  length: number;
  tokens: number;
  posts: WBWPost[];
};
