import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		react({
			babel: {
				// Ref: https://react.dev/learn/react-compiler
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
		tsconfigPaths(),
	],

	define: {
		// Fix react-markdown in debug mode (it uses a native node module)
		// https://github.com/remarkjs/react-markdown/issues/632#issuecomment-906358023=
		"process.env": {},
	},

	server: {
		proxy: {
			"/api": {
				target: "http://127.0.0.1:8080",
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
