import { Button } from "@mui/material";
import {
  type DatingProfileFillStage,
  SetupStep,
  type CommonStepProps,
  type FriendsProfileFillStage,
} from "../Step";

export interface StepProps extends CommonStepProps {
  prevStageData: FriendsProfileFillStage | DatingProfileFillStage;
}

export default function Step({ prevStageData, setStageData }: StepProps) {
  return (
    <main>
      <h1>Finished</h1>
      <Button
        onClick={() => {
          setStageData({
            ...prevStageData,
            friendsProfileData:
              prevStageData.stage === SetupStep.FRIENDS_PROFILE
                ? prevStageData.friendsProfileData
                : undefined,
            stage: SetupStep.FINISHED,
          });
        }}
      >
        Speichern und loslegen
      </Button>
    </main>
  );
}
