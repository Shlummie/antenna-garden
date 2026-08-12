import { spawn } from "node:child_process";
import process from "node:process";

const mode = process.argv[2];
if (!new Set(["dev", "build", "start"]).has(mode)) {
  console.error("Usage: node scripts/run-vinext.mjs <dev|build|start>");
  process.exit(2);
}

const executable = process.platform === "win32" ? "vinext.cmd" : "vinext";
const child = spawn(executable, [mode], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    WRANGLER_LOG_PATH: ".wrangler/wrangler.log",
  },
  shell: process.platform === "win32",
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("error", (error) => {
  console.error(`Unable to start vinext: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
