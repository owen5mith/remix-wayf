import { captureRemixErrorBoundaryError } from "@sentry/remix";
import { useContext } from "react";
import { NonceContext } from "./nonce-context";
import { Separator } from "@/components/ui/separator";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import clsx from "clsx";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { ModeToggle } from "./components/ModeToggle";
import { themeSessionResolver } from "./sessions.server";
import styles from "./tailwind.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/remix";
import { Button } from "./components/ui/button";
import { Github } from "lucide-react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

// Return the theme from the session storage using the loader
export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  return {
    theme: getTheme(),
  };
}

export const ErrorBoundary = () => {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <div>Something went wrong</div>;
};

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  );
}

function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  const nonce = useContext(NonceContext);

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} nonce={nonce} />
        <Links />
      </head>
      <body>
        <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-between px-4">
          <Outlet />
          <div className="flex w-full flex-col items-center justify-between gap-1 pt-8">
            <Separator />
            <div className="flex w-full flex-row items-center justify-between pb-4">
              <Link to={`/`}>
                <span className="text-m scroll-m-20 font-semibold tracking-tight">
                  WAYF
                </span>
              </Link>
              <div className="flex flex-row items-center">
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href="https://github.com/runandrew/remix-wayf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-0 dark:scale-100" />
                  </a>
                </Button>
                <ModeToggle />
              </div>
            </div>
          </div>
        </main>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <LiveReload nonce={nonce} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
