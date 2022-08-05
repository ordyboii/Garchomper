import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { withTRPC } from "@trpc/next";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import superjson from "superjson";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <title>Garchomper - Share images and files between devices</title>
        <link rel='shortcut icon' href='/favicon.png' type='image/png' />
      </Head>
      <Component {...pageProps} />
      <Toaster position='top-right' />
    </SessionProvider>
  );
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export default withTRPC({
  config() {
    return {
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson
    };
  },
  ssr: false
})(MyApp);
