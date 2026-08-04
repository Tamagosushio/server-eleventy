const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const codeClipboard = require("eleventy-plugin-code-clipboard");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = async function (eleventyConfig) {
  eleventyConfig.addGlobalData("metadata", {
    title: "Tamagosushi's Homepage",
    description: "This is Tamagosushi's Homepage.",
    url: "https://tamagosushi.jp",
  });
  eleventyConfig.addFilter("dateFormat", function (value) {
    const Year = value.getFullYear();
    const Month = String(value.getMonth() + 1).padStart(2, "0");
    const Date = String(value.getDate()).padStart(2, "0");
    return `${Year}-${Month}-${Date}`;
  });
  const { eleventyImageTransformPlugin } = await import("@11ty/eleventy-img");
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["auto"],
    widths: ["auto"],
    transformOnRequest: process.env.ELEVENTY_RUN_MODE === "serve",
    htmlOptions: {
      imgAttributes: {
        loading: "lazy",
        decoding: "async",
      },
    },
  });
  // Add plugins
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(codeClipboard);
  // Markdown Overrides
  const markdownLibrary = markdownIt({
    html: true,
  }).use(markdownItAnchor, {
    permalink: false,
    tabIndex: false
  }).use(codeClipboard.markdownItCopyButton)
    .use(require("markdown-it-attrs"));
  eleventyConfig.setLibrary("md", markdownLibrary);
  // Set directories to pass through to the _site folder
  [
    "src/assets/",
    "src/styles/",
    "src/js/",
    "src/favicon.ico",
    "src/apps/programlingvo/parser.js",
    "src/apps/programlingvo/grammar.pegjs",
    "src/apps/procon34-visualizer-web",
    "src/**/*.gif",
    "src/blogs/**/thumbnail.png",
    "src/blogs/thumbnails/",
  ].forEach((path) => eleventyConfig.addPassthroughCopy(path));
  // Watch directories for changes
  [
    "/src/assets/",
    "/src/styles/",
    "/src/js/",
  ].forEach((path) => eleventyConfig.addWatchTarget(path));
  // collections
  eleventyConfig.addCollection("blogs", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/blogs/**/*.md");
  });
  eleventyConfig.addCollection("apps", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/apps/*/index.html");
  });
  eleventyConfig.addCollection("tagList", function (collection) {
    let tagSet = new Set();
    collection.getAll().forEach((item) => {
      const tags = item.data.tags;
      if (Array.isArray(tags)) {
        tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return [...tagSet].sort();
  });
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
