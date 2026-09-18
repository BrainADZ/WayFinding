import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const portFlag = args.findIndex((arg) => arg === "--port" || arg === "-p");
const requested = portFlag >= 0 ? args[portFlag + 1] : process.env.PORT || "3000";
const startingPort = Number(requested);

if (!Number.isInteger(startingPort) || startingPort < 1 || startingPort > 65535) {
  console.error(`Invalid port: ${requested}`);
  process.exit(1);
}

function isAvailable(port) {
  return new Promise((result) => {
    const server = createServer();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE" || error.code === "EACCES") result(false);
      else throw error;
    });
    server.listen(port, "::", () => server.close(() => result(true)));
  });
}

let port = startingPort;
while (port <= 65535 && !(await isAvailable(port))) port += 1;
if (port > 65535) {
  console.error(`No available port found after ${startingPort}`);
  process.exit(1);
}

if (port !== startingPort) {
  console.log(`Port ${startingPort} is busy. Starting a separate dev server on ${port}.`);
}

const nextCli = resolve("node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextCli, "dev", "-p", String(port)], {
  stdio: "inherit",
  env: { ...process.env, BRAINADZ_DEV_PORT: String(port) },
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
