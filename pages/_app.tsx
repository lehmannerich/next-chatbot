import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";

import "@vercel/examples-ui/globals.css";
import Head from "next/head";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Next.js Chatbot</title>
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default App;
