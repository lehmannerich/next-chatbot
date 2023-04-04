import { supabaseAdmin } from "@/utils";

export const config = {
  runtime: "edge"
};


const handler = async (req: Request): Promise<Response> => {
  try {
    const { query, matches, table_key } = (await req.json()) as {
      query: string;
      matches: number;
      table_key: string;
    };

    console.log(table_key);

    const input = query.replace(/\n/g, " ");

    const res = await fetch("https://api.openai.com/v1/embeddings", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      method: "POST",
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input
      })
    });

    const json = await res.json();
    if (!json.data || !json.data[0] || !json.data[0].embedding) {
      console.error('Invalid response from API:', json);
      return new Response('Error', { status: 500 });
    }
    const embedding = json.data[0].embedding;

    interface Params {
      query_embedding: any;
      similarity_threshold: number;
      match_count: number;
      selected_author?: string;
    }

    let params: Params = {
      query_embedding: embedding,
      similarity_threshold: 0.2,
      match_count: matches
    };

    if (table_key !== "") {
      params.selected_author = table_key;
    }

    const { data: chunks, error } = await supabaseAdmin.rpc("pg_search", params);


    if (error) {
      console.error(error);
      return new Response("Error", { status: 500 });
    }

    return new Response(JSON.stringify(chunks), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
