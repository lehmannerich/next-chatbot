import "@/styles/globals.css";
import { Inter } from "@next/font/google";
import type { AppProps } from "next/app";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps<{}>) {
  return (
    <>
    <Head>
        <title>GPT Library</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📕</text></svg>"
          />
        <meta
          name="description"
          content={`AI-powered search and chat for Books and Essays.`}
        />
      </Head>
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
          </>
  );
}
