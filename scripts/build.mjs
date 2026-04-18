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
} else {
  if (!hasMultiAppWorkspace()) {
    throw new Error("The multi-app workspace is incomplete. Expected apps/web and apps/admin.");
  }

  await runNodeProcess(createAstroArgs("build", { app: "web", forwardArgs }));
  await runNodeProcess(createAstroArgs("build", { app: "admin", forwardArgs }));
}
