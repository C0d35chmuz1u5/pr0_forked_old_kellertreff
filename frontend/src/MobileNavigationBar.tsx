import { Link, useLocation } from "react-router-dom";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import { makeStyles } from "tss-react/mui";

import { SearchIcon, HeartIcon, SettingsIcon, UserIcon } from "@/icons";

import type { LoggedInBaseProps } from "./types";
import styles from "./MobileNavigationBar.module.scss";

const useStyles = makeStyles()({
	root: {
		backgroundColor: "#202020",
		// "&$selected": {
		// 	backgroundColor: "red",
		// }
	},
});

export default function MobileNavigationBar(_: LoggedInBaseProps) {
	const location = useLocation();
	const classes = useStyles().classes;
	return (
		<BottomNavigation
			classes={classes}
			value={location.pathname}
			style={{
				position: "fixed",
				width: "100%",
				bottom: 0,
				zIndex: 9001,
			}}
		>
			<BottomNavigationAction
				label="Finden"
				icon={<SearchIcon />}
				component={Link}
				value="/"
				to="/"
			/>
			<BottomNavigationAction
				label="Matches"
				icon={<HeartIcon />}
				component={Link}
				value="/decisions/matches"
				to="/decisions/matches"
			/>
			<BottomNavigationAction
				label="Profil"
				icon={<UserIcon />}
				component={Link}
				value="/profile"
				to="/profile"
			/>
			<BottomNavigationAction
				label="Einstellungen"
				icon={<SettingsIcon className={styles.icon} />}
				component={Link}
				value="/settings"
				to="/settings"
			/>
		</BottomNavigation>
	);
}
