const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const codeClipboard = require("eleventy-plugin-code-clipboard");
const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
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
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["auto"],
    widths: ["auto"],
    sharpOptions: {
      animated: true,
      limitInputPixels: false
    }
  });
  // Add plugins
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(codeClipboard);
  // Markdown Overrides
  const markdownLibrary = markdownIt({
    html: true,
  }).use(codeClipboard.markdownItCopyButton);
  eleventyConfig.setLibrary("md", markdownLibrary);
  // Set directories to pass through to the _site folder
  [
    "src/assets/",
    "src/styles/",
    "src/js/",
    "src/favicon.ico",
    "src/apps/procon34-visualizer-web",
    "src/**/*.{png,jpeg,jpg,gif}",].forEach((path) => eleventyConfig.addPassthroughCopy(path));

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
