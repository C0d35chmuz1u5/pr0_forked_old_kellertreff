import T from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardEnumeration from "@/component/CardEnumeration";
import CardContent from "@mui/material/CardContent";
import Link from "@mui/material/Link";
import PageContent from "@/component/PageContent";

export default function Contact() {
	return (
		<PageContent>
			<CardEnumeration>
				<Card>
					<CardContent>
						<T variant="h5" component="h1" gutterBottom>
							Kontakt
						</T>
						<T>
							Dieses Projekt wird nicht von den pr0gramm-Betreibern, sondern von
							Nutzern betrieben. Du kannst uns über eine{" "}
							<Link
								href="https://pr0gramm.com/inbox/messages/holzmaster"
								underline="hover"
							>
								private Nachricht
							</Link>{" "}
							erreichen.
						</T>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<T variant="h6" component="h2" gutterBottom>
							Fehler gefunden?
						</T>
						<T>
							Wenn Du einen Fehler gefunden hast, kannst Du ihn per{" "}
							<Link
								href="https://pr0gramm.com/inbox/messages/holzmaster"
								underline="hover"
							>
								privater Nachricht
							</Link>{" "}
							melden.
						</T>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<T variant="h6" component="h2" gutterBottom>
							Impressum
						</T>
						<T gutterBottom>
							Dieses Portal ist für den geschlossenen Kreis der Mitglieder des Portals{" "}
							<Link href="https://pr0gramm.com" underline="hover">
								pr0gramm.com
							</Link>{" "}
							und ist rein privat. Geschäftsmäßige Absichten sind nicht vorhanden.
							Demnach besteht keine Impressumspflicht nach §5 TMG.
						</T>
						<T>
							Sofern Du kein Mitglied des oben genannten geschlossenen Kreises bist,
							wirst Du hiermit dazu aufgefordert, diese Website umgehend zu verlassen.
						</T>
					</CardContent>
				</Card>
			</CardEnumeration>
		</PageContent>
	);
}
