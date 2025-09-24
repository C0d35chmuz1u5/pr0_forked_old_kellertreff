import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import { BrowserRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { swrFetcher as fetcher } from "@/api/fetch";

import AnonymousApp from "./AnonymousApp.tsx";

import "./index.css";

if (import.meta.env.VITE_SENTRY_DSN) {
  import("@sentry/react").then(sentry =>
    sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_RELEASE_IDENTIFIER,
      integrations: [],
      tracesSampleRate: 0,
    }),
  );
}

const theme = createTheme({
  palette: {
    mode: "dark",
    text: {
      primary: "#fff",
      secondary: "#999",
    },
    primary: {
      main: "#ee4d2e",
    },
    secondary: {
      main: "#b33924",
    },
    background: {
      default: "#161618",
      paper: "#212121",
    },
  },
  // https://stackoverflow.com/questions/57025427
  transitions: {
    duration: {
      shortest: 150 / 2,
      shorter: 200 / 2,
      short: 250 / 2,
      standard: 300 / 2,
      complex: 375 / 2,
      enteringScreen: 225 / 2,
      leavingScreen: 195 / 2,
    },
  },
  typography: {
    allVariants: {
      color: "#fff",
    },
  },
});

// TODO: Add Sentry.reactErrorHandler from https://github.com/getsentry/sentry-javascript/releases/tag/8.7.0
// biome-ignore lint/style/noNonNullAssertion: It's there.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SWRConfig value={{ refreshInterval: 0, fetcher }}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AnonymousApp />
        </ThemeProvider>
      </BrowserRouter>
    </SWRConfig>
  </StrictMode>,
);
