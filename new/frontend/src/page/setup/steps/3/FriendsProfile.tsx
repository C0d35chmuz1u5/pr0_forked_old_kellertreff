import { Button } from "@mui/material";

import {
  type LookingForState,
  SetupStep,
  type CommonStepProps,
  type DatingProfileFillStage,
} from "../Step";

export interface StepProps extends CommonStepProps {
  prevStageData: DatingProfileFillStage | LookingForState;
}

export default function Step({ prevStageData, setStageData }: StepProps) {
  return (
    <main>
      <h1>Friends</h1>
      <Button
        onClick={() => {
          setStageData({
            ...prevStageData,
            lookingForFriends: true,
            friendsProfileData: {
              enabled: true,
              bio: "bio",
              interests: [],
            },
            datingProfileData:
              prevStageData.stage === SetupStep.DATING_PROFILE
                ? prevStageData.datingProfileData
                : undefined,
            stage: SetupStep.FRIENDS_PROFILE,
          });
        }}
      >
        Weiter
      </Button>
    </main>
  );
}
