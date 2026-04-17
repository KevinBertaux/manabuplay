import {
  createAstroArgs,
  hasMultiAppWorkspace,
  isAppReady,
  parseCliArgs,
  runNodeProcess,
} from "./workspace-utils.mjs";

const { app, forwardArgs } = parseCliArgs(process.argv.slice(2));

if (app && !isAppReady(app)) {
  throw new Error(`App "${app}" is not ready yet.`);
} else if (app && isAppReady(app)) {
  await runNodeProcess(createAstroArgs("build", { app, forwardArgs }));
} else if (hasMultiAppWorkspace()) {
  await runNodeProcess(createAstroArgs("build", { app: "web", forwardArgs }));
  await runNodeProcess(createAstroArgs("build", { app: "admin", forwardArgs }));
} else {
  console.log("[build] Multi-app workspace not ready yet. Building the current monolith app.");
  await runNodeProcess(createAstroArgs("build", { forwardArgs }));
}
