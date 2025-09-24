import { lazy, useEffect, useState } from "react";
import lazyWithPreload from "react-lazy-with-preload";
import { Routes, Route, useMatch, Navigate, useNavigate } from "react-router-dom";
import { useCookie } from "react-use";

import "./App.scss";

import MobileNavigationBar from "./MobileNavigationBar";
import type { KTSession, LoggedInBaseProps } from "./types";
import { API_BASE, DEV } from "./client-constants";

import { LoadingSuspense } from "@/component/Loading";
import useIsPhoneLayout from "@/hooks/useIsPhoneLayout";

import FindPage from "@/page/find/Find";
import LoginPage from "@/page/login/Login";
import NotFoundPage from "@/page/404";

const ContactLazy = lazy(() => import("@/page/Contact"));
// const TermsLazy = lazy(() => importMdx("./page/Terms.mdx"));

// We preload some components. If the user clicks on them, they should load instantly.
// The ones that are not needed are lazy-loaded
// TODO: Re-Consider if we really want to lazy-load this
const ProfileLazy = lazyWithPreload(() => import("@/page/profile/Profile"));
const DecisionsLazy = lazyWithPreload(() => import("@/page/decisions/Decisions"));
const SettingsLazy = lazyWithPreload(() => import("@/page/settings/Settings"));
const SetupLazy = lazy(() => import("@/page/setup/Setup"));
const StatsLazy = lazy(() => import("@/page/Stats"));
const AdminLazy = lazy(() => import("@/page/Admin"));
const DevLazy = lazy(() => import("@/page/_dev/Dev"));

function AnonymousApp() {
	return (
		<>
			<main className="container">
				<LoadingSuspense>
					<Routes>
						<Route path="/" element={<LoginPage />} />
						<Route path="/contact" element={<ContactLazy />} />
						<Route path="/_dev" Component={DevLazy} />
						{/* <Route path="/terms" element={<TermsLazy />} /> */}
						<Route path="*" element={<Navigate replace to="/" />} />
					</Routes>
				</LoadingSuspense>
			</main>
		</>
	);
}

/**
 * Maybe we can use a context instead of property-drilling the session object.
 * I like the current approach because it makes clear which components need a valid session.
 */
function LoggedInApp({ session }: LoggedInBaseProps) {
	const isMobile = useIsPhoneLayout();
	const isInSetup = useMatch("/setup");
	return (
		<>
			<main className="container adjust-for-navbar">
				<LoadingSuspense>
					<Routes>
						<Route path="/" element={<FindPage session={session} />} />
						<Route path="/decisions/*" element={<DecisionsLazy session={session} />} />
						<Route path="/profile" element={<ProfileLazy session={session} />} />
						<Route path="/settings" element={<SettingsLazy session={session} />} />
						<Route path="/setup" element={<SetupLazy session={session} />} />
						<Route path="/admin" element={<AdminLazy session={session} />} />
						<Route path="/contact" Component={ContactLazy} />
						<Route path="/_dev" Component={DevLazy} />
						{/* <Route path="/terms" element={<TermsLazy />} /> */}
						<Route path="/stats" element={<StatsLazy session={session} />} />
						<Route path="*" Component={NotFoundPage} />
					</Routes>
				</LoadingSuspense>
			</main>
			{(isMobile || !isMobile) && !isInSetup && <MobileNavigationBar session={session} />}
		</>
	);
}

export default function App() {
	const sessionData = useSessionData();

	useEffect(() => {
		ProfileLazy.preload();
		DecisionsLazy.preload();
		SettingsLazy.preload();
	}, []);

	return sessionData ? <LoggedInApp session={sessionData} /> : <AnonymousApp />;
}

function useSessionData() {
	const [, , deleteSessionCookie] = useCookie("session");
	const [sessionData, setSessionData] = useState<KTSession | undefined>(undefined);
	const navigate = useNavigate();

	// WTF
	useEffect(() => {
		fetch(API_BASE + "/me")
			.then(r => r.json())
			.then(r => {
				const session = r.data.loggedIn
					? {
							token: r.data.token,
							info: r.data.user,
							logOut,
						}
					: undefined;
				setSessionData(session);
				if (r.data.loggedIn && !r.data.profileCompleted) {
					navigate("/setup");
				}
			})
			.catch(e => {
				DEV && console.error(e);
				// logOut();
			});

		function logOut() {
			deleteSessionCookie();
			// navigate("/");
			window.location.reload();
		}
	}, [deleteSessionCookie, navigate]);

	return sessionData;
}
