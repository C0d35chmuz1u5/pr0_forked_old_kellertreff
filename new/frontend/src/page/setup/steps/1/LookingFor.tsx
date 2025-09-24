import { useId, useState } from "react";
import { Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";

import { SetupStep, type CommonStepProps, type WelcomeState } from "../Step";

export interface StepProps extends CommonStepProps {
  prevStageData: WelcomeState;
}

export default function Step({ prevStageData, setStageData }: StepProps) {
  type Value = "dating" | "friends" | "both";

  const label = useId();
  const [value, setValue] = useState<"" | Value>("");

  return (
    <main>
      <FormControl>
        <FormLabel id={label}>Weshalb bist du hier?</FormLabel>
        <RadioGroup
          aria-labelledby={label}
          name="controlled-radio-buttons-group"
          value={value}
          onChange={e => setValue(e.currentTarget.value as Value)}
        >
          <FormControlLabel value="dating" control={<Radio />} label="Dates finden" />
          <FormControlLabel value="friends" control={<Radio />} label="Freunde finden" />
          <FormControlLabel
            value="both"
            control={<Radio />}
            label="Beides - keine Umkreissuche, Ortsangabe optional"
          />
        </RadioGroup>
      </FormControl>
      {
        <nav>
          <Button
            size="large"
            variant="contained"
            color="primary"
            disabled={value === ""}
            onClick={() =>
              setStageData({
                ...prevStageData,
                lookingForDates: value === "both" || value === "dating",
                lookingForFriends: value === "both" || value === "friends",
                stage: SetupStep.LOOKING_FOR,
              })
            }
          >
            Weiter
          </Button>
        </nav>
      }
    </main>
  );
}
