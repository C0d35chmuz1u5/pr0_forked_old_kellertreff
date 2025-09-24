import { memo, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import type { ApiResponse } from "./shared/src/api-types";

export interface LoggedInAppProps {
  me: ApiResponse["get"]["/me"] & { loggedIn: true };
}

export default memo(function LoggedInApp({ me }: LoggedInAppProps) {
  return (
    <Suspense>
      <Routes>
        <Route path="/" element={<div>Hallo {me.user.name}</div>} />
      </Routes>
    </Suspense>
  );
});
