/*
run by the docker HEALTHCHECK command.
Not using curl because
- it's a separate dependency
- we need to know which port we are using (we need access to config.ts)
*/

import config from "./config.js";

try {
  const res = await fetch(`http://127.0.0.1:${config.api.port}/_health`);
  if (!res.ok) {
    console.error(`HTTP error! status: ${res.status}`);
    process.exit(1);
  }
  // biome-ignore lint/suspicious/noExplicitAny: :shrug:
  const json = (await res.json()) as any;
  if (json.status !== "ok") {
    console.log("Healthcheck not ok: ", JSON.stringify(json));
    process.exit(1);
  }

  process.exit(0);
} catch (err) {
  console.error(`Error: ${err}`);
  process.exit(1);
}
