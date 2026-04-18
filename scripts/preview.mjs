import {
  APP_PORTS,
  ROOT_DIR,
  createAstroArgs,
  hasMultiAppWorkspace,
  isAppReady,
  parseCliArgs,
  withDefaultPort,
} from "./workspace-utils.mjs";
import { spawn } from "node:child_process";

const { app, forwardArgs } = parseCliArgs(process.argv.slice(2));

if (app && !isAppReady(app)) {
  throw new Error(`App "${app}" is not ready yet.`);
}

if (!hasMultiAppWorkspace()) {
  throw new Error("The multi-app workspace is incomplete. Expected apps/web and apps/admin.");
}

const targetApp = app ?? "web";
const args = createAstroArgs("preview", {
  app: targetApp,
  forwardArgs: withDefaultPort(forwardArgs, APP_PORTS[targetApp]),
});

const child = spawn(process.execPath, args, {
  cwd: ROOT_DIR,
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
