import { createAstroArgs, hasMultiAppWorkspace, parseCliArgs, runNodeProcess } from "./workspace-utils.mjs";

const { app, forwardArgs } = parseCliArgs(process.argv.slice(2));

if (hasMultiAppWorkspace()) {
  if (app) {
    await runNodeProcess(createAstroArgs("build", { app, forwardArgs }));
  } else {
    await runNodeProcess(createAstroArgs("build", { app: "web", forwardArgs }));
    await runNodeProcess(createAstroArgs("build", { app: "admin", forwardArgs }));
  }
} else {
  console.log("[build] Multi-app workspace not ready yet. Building the current monolith app.");
  await runNodeProcess(createAstroArgs("build", { forwardArgs }));
}
