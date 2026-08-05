const { existsSync, readFileSync, readdirSync } = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const outputRoot = path.join(projectRoot, "_site");

const requiredOutputs = [
  "_site/index.html",
  "_site/404/index.html",
  "_site/50x/index.html",
  "_site/apps/programlingvo/index.html",
  "_site/apps/programlingvo/parser.js",
  "_site/apps/programlingvo/programlingvo-worker.js",
  "_site/apps/programlingvo/grammar.pegjs",
  "_site/apps/programlingvo/peggy.min.js",
  "_site/apps/programlingvo/bootstrap.min.css",
  "_site/apps/procon34-visualizer-web/index.html",
  "_site/apps/procon34-visualizer-web/procon34-visualizer-web.js",
  "_site/apps/procon34-visualizer-web/procon34-visualizer-web.wasm",
  "_site/apps/procon34-visualizer-web/procon34-visualizer-web.data",
];

const forbiddenOutputs = [
  "_site/tags/apps/index.html",
  "_site/tags/blogs/index.html",
];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  });
}

function decodeHtmlAttribute(value) {
  return value.replaceAll("&amp;", "&").replaceAll("&#39;", "'").replaceAll("&quot;", '"');
}

function resolveLocalTarget(pagePath, url) {
  const withoutQueryOrHash = url.split(/[?#]/, 1)[0];
  if (!withoutQueryOrHash) {
    return [];
  }

  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(withoutQueryOrHash);
  } catch {
    decodedUrl = withoutQueryOrHash;
  }

  const target = decodedUrl.startsWith("/")
    ? path.join(outputRoot, decodedUrl.slice(1))
    : path.resolve(path.dirname(pagePath), decodedUrl);

  const candidates = [target];
  if (!path.extname(target)) {
    candidates.push(path.join(target, "index.html"), `${target}.html`);
  }
  return candidates;
}

function findBrokenLocalLinks() {
  const htmlFiles = walk(outputRoot).filter((filePath) => filePath.endsWith(".html"));
  const attributePattern = /(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  const skippedProtocol = /^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i;
  const broken = [];

  for (const pagePath of htmlFiles) {
    const html = readFileSync(pagePath, "utf8");
    for (const match of html.matchAll(attributePattern)) {
      const url = decodeHtmlAttribute(match[1] ?? match[2] ?? match[3]);
      if (!url || url.startsWith("#") || skippedProtocol.test(url)) {
        continue;
      }

      const candidates = resolveLocalTarget(pagePath, url);
      if (candidates.length > 0 && !candidates.some(existsSync)) {
        broken.push({
          page: path.relative(outputRoot, pagePath),
          url,
        });
      }
    }
  }

  return broken;
}

const missing = requiredOutputs.filter(
  (relativePath) => !existsSync(path.join(projectRoot, relativePath)),
);
const unexpected = forbiddenOutputs.filter((relativePath) =>
  existsSync(path.join(projectRoot, relativePath)),
);
const brokenLinks = existsSync(outputRoot) ? findBrokenLocalLinks() : [];

if (missing.length > 0 || unexpected.length > 0 || brokenLinks.length > 0) {
  if (missing.length > 0) {
    console.error("Missing required build outputs:");
    missing.forEach((relativePath) => console.error(`  - ${relativePath}`));
  }
  if (unexpected.length > 0) {
    console.error("Unexpected build outputs:");
    unexpected.forEach((relativePath) => console.error(`  - ${relativePath}`));
  }
  if (brokenLinks.length > 0) {
    console.error("Broken local links:");
    brokenLinks.forEach(({ page, url }) => console.error(`  - ${page}: ${url}`));
  }
  process.exitCode = 1;
} else {
  console.log("Build output verification passed, including local links.");
}
