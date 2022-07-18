import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { withTRPC } from "@trpc/next";
import superjson from "superjson";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

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
  ssr: true
})(MyApp);
