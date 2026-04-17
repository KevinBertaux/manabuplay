import { spawn } from "node:child_process";
import {
  APP_PORTS,
  ROOT_DIR,
  createAstroArgs,
  hasMultiAppWorkspace,
  isAppReady,
  parseCliArgs,
  prefixStream,
  withDefaultPort,
} from "./workspace-utils.mjs";

const { app, forwardArgs } = parseCliArgs(process.argv.slice(2));

if (app && !isAppReady(app)) {
  throw new Error(`App "${app}" is not ready yet.`);
} else if (app && isAppReady(app)) {
  const args = createAstroArgs("dev", {
    app,
    forwardArgs: withDefaultPort(forwardArgs, APP_PORTS[app] ?? APP_PORTS.web),
  });
  const child = spawn(process.execPath, args, {
    cwd: ROOT_DIR,
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    process.exit(code ?? 1);
  });
} else if (!hasMultiAppWorkspace()) {
  console.log("[dev] Multi-app workspace not ready yet. Falling back to the current monolith app.");
  const args = createAstroArgs("dev", { forwardArgs });
  const child = spawn(process.execPath, args, {
    cwd: ROOT_DIR,
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    process.exit(code ?? 1);
  });
} else {
  const children = [];

  function stopAll() {
    for (const child of children) {
      if (!child.killed) {
        child.kill("SIGINT");
      }
    }
  }

  for (const workspace of ["web", "admin"]) {
    const args = createAstroArgs("dev", {
      app: workspace,
      forwardArgs: withDefaultPort(forwardArgs, APP_PORTS[workspace]),
    });
    const child = spawn(process.execPath, args, {
      cwd: ROOT_DIR,
      stdio: ["inherit", "pipe", "pipe"],
    });

    prefixStream(child.stdout, workspace, process.stdout);
    prefixStream(child.stderr, workspace, process.stderr);

    child.on("exit", (code) => {
      if (code && code !== 0) {
        stopAll();
        process.exit(code);
      }
    });

    children.push(child);
  }

  process.on("SIGINT", () => {
    stopAll();
    process.exit(130);
  });

  process.on("SIGTERM", () => {
    stopAll();
    process.exit(143);
  });
}
