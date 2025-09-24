import type { JSX } from "react";
import { Link } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MuiLink from "@mui/material/Link";

import { DEV, API_BASE } from "../../client-constants";
import Step from "./Step";

import { APP_NAME } from "@/shared/constants";
import { LogInIcon } from "@/icons";

import "./Login.scss";

const DebugLoginButton = DEV
	? () => {
			// Component that is used in DEV builds
			// We use the endpoint /api/session/1 to create a session for any user id
			// This endpoint is (hopefully!) only available in dev mode

			const userId = document.location.hash ? document.location.hash.substring(1) : 1;

			function debugLogin() {
				fetch(`/api/session/${userId}`)
					.then(r => r.json())
					.then(_ => window.location.reload());
			}

			return (
				<Button
					size="large"
					variant="contained"
					color="primary"
					onClick={debugLogin}
					startIcon={<LogInIcon />}
				>
					Mit User-ID {userId} anmelden
				</Button>
			);
		}
	: (undefined as unknown as () => JSX.Element);

export default function LoginPage() {
	const loginButton = DEV ? (
		<DebugLoginButton />
	) : (
		<Button
			size="large"
			variant="contained"
			color="primary"
			href={API_BASE + "/auth/login"}
			startIcon={<LogInIcon />}
		>
			Mit pr0gramm anmelden
		</Button>
	);

	return (
		<div className="container intro">
			<Typography variant="h3" component="h1">
				{APP_NAME}
			</Typography>
			<Typography variant="subtitle1" color="textSecondary">
				Endlich normale Leute!
			</Typography>

			<Typography gutterBottom>
				Du suchst einen anderen Menschen?
				<br />
				Zum Zocken, Unterhalten, für ein Projekt oder Treffen?
				<br />
				Dann bist Du hier richtig!
			</Typography>

			<Typography variant="h5" component="h2" gutterBottom>
				So funktioniert's
			</Typography>

			<div className="how-it-works">
				<Step number={1} heading="Einloggen" showLine>
					Logge Dich mit Deinem pr0gramm-Account ein.{" "}
					<b>Dein Passwort wird nicht benötigt.</b>
				</Step>

				<Step number={2} heading="Schreibe einen Text" showLine>
					Er kann beschreiben, wen Du suchst. Oder beschreibe Dich selbst – oder etwas
					ganz anderes!
					<br />
					Lass' Deiner Kreativität freien Lauf!
				</Step>

				{/*
				<p>
					<span className="muted">Wenn Du magst</span>,
					kannst Du auch Dein Land und deine Postleitzahl angeben.
					Sie werden später in die Suche nach Menschen mit einbezogen.
				</p>
				*/}
				<Step number={3} heading="Wähle Tags" showLine>
					Wähle ein paar pr0gramm-Tags, die dazu passen, was oder wen Du suchst.
					<br />
					Die Tags beeinflussen zwar Deine Vorschläge, aber begrenzen sie nicht auf diese.
				</Step>

				<Step number={4} heading="Vote!">
					Dir werden Tags und Texte von anderen vorgeschlagen. <br />
					Bei einem Match bekommt Ihr beide eine private Nachricht auf pr0gramm.com.{" "}
					<br />
					Ihr erfahrt Eure Namen nur bei einem Match!
				</Step>
			</div>

			<Typography color="textSecondary" className="hint">
				<span className="tldr">tl;dr:</span>{" "}
				<small>Wie bei Tinder, nur mit Texten und Tags.</small>
			</Typography>

			{loginButton}
			<Typography color="textSecondary" className="hint">
				<i>Hinweis:</i> Du musst in Deinem Browser auf pr0gramm.com eingeloggt sein.
			</Typography>

			<MuiLink component={Link} to="/contact" underline="hover">
				Kontakt 😊
			</MuiLink>
		</div>
	);
}
