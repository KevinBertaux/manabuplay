import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(currentFile);

export const ROOT_DIR = path.resolve(scriptsDir, "..");
export const ASTRO_BIN = path.join(ROOT_DIR, "node_modules", "astro", "bin", "astro.mjs");
export const APP_PORTS = {
  web: 4321,
  admin: 4322,
};

const APP_CONFIGS = {
  web: path.join(ROOT_DIR, "apps", "web", "astro.config.mjs"),
  admin: path.join(ROOT_DIR, "apps", "admin", "astro.config.mjs"),
};

const ROOT_ASTRO_CONFIG = path.join(ROOT_DIR, "astro.config.mjs");

function getAppPagesDir(app) {
  return path.join(ROOT_DIR, "apps", app, "src", "pages");
}

function getCliConfigPath(app) {
  const relativePath = path.relative(ROOT_DIR, APP_CONFIGS[app]);
  return relativePath.startsWith(".") ? relativePath : `.${path.sep}${relativePath}`;
}

export function parseCliArgs(argv) {
  const forwardArgs = [];
  let app = null;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--app") {
      app = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (token.startsWith("--app=")) {
      app = token.slice("--app=".length) || null;
      continue;
    }

    forwardArgs.push(token);
  }

  return { app, forwardArgs };
}

export function hasMonolithApp() {
  return existsSync(ROOT_ASTRO_CONFIG);
}

export function isAppReady(app) {
  return existsSync(APP_CONFIGS[app]) && existsSync(getAppPagesDir(app));
}

export function hasMultiAppWorkspace() {
  return isAppReady("web") && isAppReady("admin");
}

export function ensureAstroAvailable() {
  if (!existsSync(ASTRO_BIN)) {
    throw new Error("Astro binary not found. Run `npm install` first.");
  }
}

export function withDefaultPort(args, port) {
  if (args.includes("--port") || args.includes("-p") || args.some((arg) => arg.startsWith("--port="))) {
    return args;
  }

  return [...args, "--port", String(port)];
}

export function createAstroArgs(command, options = {}) {
  const { app, forwardArgs = [] } = options;

  ensureAstroAvailable();

  if (app && isAppReady(app)) {
    return [ASTRO_BIN, command, "--config", getCliConfigPath(app), ...forwardArgs];
  }

  if (hasMonolithApp()) {
    return [ASTRO_BIN, command, ...forwardArgs];
  }

  if (app) {
    throw new Error(`App "${app}" is not ready yet and no monolith fallback is available.`);
  }

  throw new Error("No runnable Astro app was found.");
}

export function runNodeProcess(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: ROOT_DIR,
      stdio: "inherit",
      ...options,
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(signal ? `Process stopped with signal ${signal}` : `Process exited with code ${code}`));
    });
  });
}

export function runNpmScript(scriptName) {
  const npmExecPath = process.env.npm_execpath;

  if (!npmExecPath) {
    throw new Error("npm_execpath is missing. Run this script through npm.");
  }

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [npmExecPath, "run", scriptName], {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(signal ? `npm run ${scriptName} stopped with signal ${signal}` : `npm run ${scriptName} exited with code ${code}`));
    });
  });
}

export function prefixStream(stream, prefix, target) {
  let buffer = "";

  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      target.write(`[${prefix}] ${line}\n`);
    }
  });

  stream.on("end", () => {
    if (buffer) {
      target.write(`[${prefix}] ${buffer}\n`);
      buffer = "";
    }
  });
}
