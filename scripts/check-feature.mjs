import { runNpmScript } from "./workspace-utils.mjs";

const scripts = ["check", "test:unit", "build"];

for (const scriptName of scripts) {
  console.log(`\n> npm run ${scriptName}`);
  await runNpmScript(scriptName);
}
