import { Button } from "@mui/material";
import Typography from "@mui/material/Typography";

import type { CommonStepProps, InitialState } from "../Step";
import { SetupStep } from "../Step";

import styles from "./Welcome.module.scss";

export interface StepProps extends CommonStepProps {
  prevStageData: InitialState;
}

export default function Step({ prevStageData, setStageData }: StepProps) {
  const me = prevStageData.me;
  if (!me.loggedIn) {
    throw new Error("Not logged in");
  }

  return (
    <main>
      <div>
        <img src="/safari-pinned-tab.svg" alt="Kellertreff-Logo" className={styles.logo} />
      </div>

      <Typography variant="h3" component="h1" gutterBottom className={styles.greeting}>
        Hallo {me.user.name}!
      </Typography>
      <Typography gutterBottom className={styles.message}>
        Bevor Du mit Kellertreff loslegen kannst, musst du noch dein Profil ausfüllen.
      </Typography>
      <Typography gutterBottom className={styles.message}>
        Legen wir gleich los!
      </Typography>
      {
        <nav>
          <Button
            size="large"
            variant="contained"
            color="primary"
            onClick={() => setStageData({ ...prevStageData, stage: SetupStep.WELCOME })}
          >
            Weiter
          </Button>
        </nav>
      }
    </main>
  );
}
