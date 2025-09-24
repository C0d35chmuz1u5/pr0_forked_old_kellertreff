import { useEffect } from "react";
import { Routes, useLocation } from "react-router";
import { NavLink, Route } from "react-router-dom";
import lazyWithPreload from "react-lazy-with-preload";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AppBar from "@mui/material/AppBar";

import { LoadingSuspense } from "@/component/Loading";
import Matches from "@/page/decisions/Matches";

import type { LoggedInBaseProps } from "../../types";

const VotesLazy = lazyWithPreload(() => import("@/page/decisions/Votes"));

export default function Decisions({ session }: LoggedInBaseProps) {
	const { pathname } = useLocation();

	useEffect(() => void VotesLazy.preload(), []);

	return (
		<>
			<AppBar position="sticky" color="default">
				<Tabs
					value={pathname}
					indicatorColor="primary"
					textColor="primary"
					variant="fullWidth"
				>
					<Tab
						label="Matches"
						component={NavLink}
						value="/decisions/matches"
						to="/decisions/matches"
					/>
					<Tab
						label="Letzte Votes"
						component={NavLink}
						value="/decisions/votes"
						to="/decisions/votes"
					/>
				</Tabs>
			</AppBar>
			<Routes>
				<Route path="/matches" element={<Matches session={session} />} />
				<Route
					path="/votes"
					element={
						<LoadingSuspense>
							<VotesLazy session={session} />
						</LoadingSuspense>
					}
				/>
			</Routes>
		</>
	);
}
