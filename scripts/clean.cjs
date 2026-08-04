const { rmSync } = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const outputDirectory = path.resolve(projectRoot, "_site");

if (path.dirname(outputDirectory) !== projectRoot) {
  throw new Error(`Refusing to clean unexpected path: ${outputDirectory}`);
}

rmSync(outputDirectory, { recursive: true, force: true });
console.log(`Removed generated output: ${outputDirectory}`);
