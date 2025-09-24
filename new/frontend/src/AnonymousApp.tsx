import { lazy, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import lazyWithPreload from "react-lazy-with-preload";
import Button from "@mui/material/Button";

import useApi from "@/api/useApi";
import SetUp from "@/page/setup/SetUp";

const AppLazyPreloadable = lazyWithPreload(() => import("./LoggedInApp"));

const DevLazy = lazy(() => import("./_dev/Dev"));

export default function App() {
  const meRes = useApi("/me");

  useEffect(() => {
    AppLazyPreloadable.preload();
  }, []);

  if (meRes.error) {
    return <div>Error</div>;
  }

  if (!meRes.data) {
    return <div>Loading...</div>;
  }

  const me = meRes.data;

  if (!me.loggedIn) {
    return <LoginPage />;
  }

  if (!me.setupCompleted) {
    return <SetUp me={me} />;
  }

  return (
    <Suspense>
      <Routes>
        <Route path="/_dev" element={<DevLazy />} />
        <Route path="/" element={<AppLazyPreloadable me={me} />} />
      </Routes>
    </Suspense>
  );
}

function LoginPage() {
  return (
    <Button
      onClick={() => {
        window.location.href = "/api/_dev/session/1";
      }}
    >
      Bitte einloggen
    </Button>
  );
}
