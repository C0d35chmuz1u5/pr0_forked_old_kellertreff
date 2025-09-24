import { version as reactVersion } from "react";
import { version as reactRouterVersion } from "react-dom";

export default function Dev() {
  return (
    <p>
      <dt>Stage:</dt>
      <dd>
        <code>{import.meta.env.MODE}</code>
      </dd>
      <dt>Version:</dt>
      <dd>
        <code>{import.meta.env.VITE_RELEASE_IDENTIFIER}</code>
      </dd>
      <dt>React-Version:</dt>
      <dd>
        <code>{reactVersion}</code>
      </dd>
      <dt>React-Dom-Version:</dt>
      <dd>
        <code>{reactRouterVersion}</code>
      </dd>
    </p>
  );
}
