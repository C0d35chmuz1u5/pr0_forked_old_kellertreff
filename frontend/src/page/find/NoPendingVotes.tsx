import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import T from "@mui/material/Typography";

import CardFooter from "@/component/CardFooter";
import ButtonGroup from "@mui/material/ButtonGroup";

export default function NoPendingVotes() {
	return (
		<Card>
			<CardContent>
				<T variant="h5">Es gibt momentan keine Vorschläge mehr für Dich.</T>
				<T variant="h6">Komm' doch morgen wieder!</T>
				<T>Du kannst Dir bis dahin auch Deine bisherigen Matches und Votes anschauen:</T>
			</CardContent>
			<CardFooter variant="center">
				<ButtonGroup variant="text" color="primary" aria-label="text primary button group">
					<Button size="large" component={Link} to="/decisions/votes">
						Votes
					</Button>
					<Button size="large" component={Link} to="/decisions/matches">
						Matches
					</Button>
				</ButtonGroup>
			</CardFooter>
		</Card>
	);
}
