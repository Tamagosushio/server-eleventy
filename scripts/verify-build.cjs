const { existsSync } = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

const requiredOutputs = [
  "_site/index.html",
  "_site/404/index.html",
  "_site/50x/index.html",
  "_site/apps/programlingvo/index.html",
  "_site/apps/programlingvo/parser.js",
  "_site/apps/programlingvo/grammar.pegjs",
  "_site/apps/procon34-visualizer-web/index.html",
  "_site/apps/procon34-visualizer-web/procon34-visualizer-web.js",
  "_site/apps/procon34-visualizer-web/procon34-visualizer-web.wasm",
  "_site/apps/procon34-visualizer-web/procon34-visualizer-web.data",
];

const forbiddenOutputs = [
  "_site/tags/apps/index.html",
  "_site/tags/blogs/index.html",
];

const missing = requiredOutputs.filter(
  (relativePath) => !existsSync(path.join(projectRoot, relativePath)),
);
const unexpected = forbiddenOutputs.filter((relativePath) =>
  existsSync(path.join(projectRoot, relativePath)),
);

if (missing.length > 0 || unexpected.length > 0) {
  if (missing.length > 0) {
    console.error("Missing required build outputs:");
    missing.forEach((relativePath) => console.error(`  - ${relativePath}`));
  }
  if (unexpected.length > 0) {
    console.error("Unexpected build outputs:");
    unexpected.forEach((relativePath) => console.error(`  - ${relativePath}`));
  }
  process.exitCode = 1;
} else {
  console.log("Build output verification passed.");
}
