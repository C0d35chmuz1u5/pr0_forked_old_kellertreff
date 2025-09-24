import type { PropsWithChildren } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import { formatNumber } from "../util";
import CardFooter from "./CardFooter";

export function StatCard({ children, value }: PropsWithChildren & { value: string | number }) {
	const formattedValue = typeof value === "number" ? formatNumber(value) : value;

	return (
		<Card>
			<CardContent>
				<Typography variant="h5" component="h2">
					{formattedValue}
				</Typography>
			</CardContent>
			<CardFooter>
				<Typography variant="subtitle1" color="textSecondary">
					{children}
				</Typography>
			</CardFooter>
		</Card>
	);
}
