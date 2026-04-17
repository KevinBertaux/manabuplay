import { runNpmScript } from "./workspace-utils.mjs";

const scripts = [
  "check",
  "test:unit",
  "build",
  "test:e2e:ui-guards",
  "test:e2e:critical",
];

for (const scriptName of scripts) {
  console.log(`\n> npm run ${scriptName}`);
  await runNpmScript(scriptName);
}
