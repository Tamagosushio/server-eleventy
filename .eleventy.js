const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");

module.exports = function(eleventyConfig) {
  eleventyConfig.addFilter("dateFormat", function (value) {
    const Year = value.getFullYear();
    const Month = (parseInt(value.getMonth()) + 1).toString().padStart(2, "0");
    const Date = value.getDate().toString().padStart(2, "0");
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
  // Set directories to pass through to the _site folder
  eleventyConfig.addPassthroughCopy("src/assets/");
  eleventyConfig.addPassthroughCopy("src/styles/");
  eleventyConfig.addPassthroughCopy("src/js/");
  // Watch scss folder for changes
  eleventyConfig.addWatchTarget("/src/assets/");
  eleventyConfig.addWatchTarget("/src/styles/");
  eleventyConfig.addWatchTarget("/src/js/");
  // collections
	eleventyConfig.addCollection("blogs", function (collectionApi) {
		return collectionApi.getFilteredByGlob("src/blogs/**/*.md");
	});
	eleventyConfig.addCollection("apps", function (collectionApi) {
		return collectionApi.getFilteredByGlob("src/apps/*/index.html");
	});
  // passthrough
  eleventyConfig.addPassthroughCopy("src/apps/procon34-visualizer-web");
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
