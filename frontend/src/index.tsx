import { SWRConfig } from "swr";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import {
	createTheme as createLegacyModeTheme,
	unstable_createMuiStrictModeTheme as createStrictModeTheme,
	ThemeProvider,
	StyledEngineProvider,
} from "@mui/material/styles";

import CssBaseline from "@mui/material/CssBaseline";

import "typeface-roboto";

import { PromptToInstallProvider } from "@/page/settings/PromptToInstallProvider";

import { DEV } from "./client-constants";

import App from "./App";

// Taken from the docs: https://swr.vercel.app/docs/error-handling
const fetcher: typeof fetch = async (resource, init) => {
	const response = await fetch(resource, init);
	if (!response.ok) {
		throw new Error("An error occurred while fetching the data.");
	}
	return response.json();
};

// TODO: Change when this is fixed: https://github.com/mui-org/material-ui/issues/13394
const createTheme = DEV ? createStrictModeTheme : createLegacyModeTheme;

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
	typography: {
		allVariants: {
			color: "#fff",
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
});

// biome-ignore lint/style/noNonNullAssertion: It's there.
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<SWRConfig value={{ refreshInterval: 0, fetcher }}>
			<PromptToInstallProvider>
				<StyledEngineProvider injectFirst>
					<ThemeProvider theme={theme}>
						<Router>
							<CssBaseline />
							<App />
						</Router>
					</ThemeProvider>
				</StyledEngineProvider>
			</PromptToInstallProvider>
		</SWRConfig>
	</StrictMode>,
);
