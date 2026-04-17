import path from "node:path";
import {
  ROOT_DIR,
  createAstroArgs,
  hasMultiAppWorkspace,
  isAppReady,
  parseCliArgs,
  runNodeProcess,
} from "./workspace-utils.mjs";

const { app, forwardArgs } = parseCliArgs(process.argv.slice(2));
const pxGuardPath = path.join(ROOT_DIR, "scripts", "check-px-values.mjs");

if (app && !isAppReady(app)) {
  throw new Error(`App "${app}" is not ready yet.`);
} else if (app && isAppReady(app)) {
  await runNodeProcess(createAstroArgs("check", { app, forwardArgs }));
} else if (hasMultiAppWorkspace()) {
  await runNodeProcess(createAstroArgs("check", { app: "web", forwardArgs }));
  await runNodeProcess(createAstroArgs("check", { app: "admin", forwardArgs }));
} else {
  console.log("[check] Multi-app workspace not ready yet. Checking the current monolith app.");
  await runNodeProcess(createAstroArgs("check", { forwardArgs }));
}

await runNodeProcess([pxGuardPath]);
