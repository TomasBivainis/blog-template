const fs = require("fs");
const path = require("path");
const yaml = require("yaml");
const { marked } = require("marked");
const {
  parseMetadata,
  wrapContent,
  fillTemplate,
  parsePostTitle,
} = require("./util/module");

/*
 * Writes the parsed post to a HTML file in the given location.
 */
function writePosts(postName, filledTemplate, parsedPostsFolder) {
  fs.writeFileSync(path.join(parsedPostsFolder, postName), filledTemplate);
}

/*
 * Parses the posts in the given postsFolder, generates HTML
 * versions of the posts and writes them to the given
 * parsedPostsFolder location.
 */
function parseMarkdownPosts(postsFolder, parsedPostsFolder, blogConfig) {
  fs.readdir(postsFolder, (err, files) => {
    if (err) {
      return console.error("Unable to scan directory", err);
    }

    files.forEach((file) => {
      const fileText = fs.readFileSync(path.join(postsFolder, file), "utf8");
      const splitData = fileText.split("---\n");

      const content = splitData[2].trim();

      const elements = {};

      const postMetaData = JSON.parse(JSON.stringify(blogConfig));
      parseMetadata(splitData[1].trim(), postMetaData);
      postMetaData["name"] = file.split(".")[0] + ".html";

      elements["title"] = wrapContent(
        file.split(".")[0].replaceAll("_", " "),
        "h1",
        "title"
      );
      elements["content"] = wrapContent(marked(content), "div", "content");
      elements["date"] = wrapContent(postMetaData["date"], "div", "date");
      elements["catagories"] = wrapContent(
        postMetaData["catagories"],
        "span",
        "catagories"
      );
      elements["header"] = wrapContent(postMetaData["title"], "h1", "header");

      const parsedContent = fillTemplate(elements, postMetaData["template"]);

      writePosts(postMetaData["name"], parsedContent, parsedPostsFolder);
    });
  });
}

/*
 * Clears the parsed posts.
 */
function clearDist(distPath) {
  const files = fs.readdirSync(distPath);

  files.forEach((file) => {
    fs.rmSync(path.join(distPath, file));
  });
}

/*
 * Parses the data from the config file and returns it as a map.
 */
function parseConfigFile(configFilePath) {
  const file = fs.readFileSync(configFilePath, "utf-8");
  const data = yaml.parse(file);

  return data;
}

function generateMainPage(srcPath, configData, postsPath) {
  const elements = {};

  elements["header"] = wrapContent(configData["title"], "h1", "header");
  elements["description"] = wrapContent(
    configData["description"],
    "div",
    "description"
  );

  let postsElement = "";

  const files = fs.readdirSync(postsPath);

  files.forEach((file) => {
    let postElement = `<a href="posts/${
      file.split(".")[0]
    }.html">${parsePostTitle(file)}</a>`;

    postsElement += postElement;
  });

  elements["posts"] = wrapContent(postsElement, "div", "posts");

  const filledTemplate = fillTemplate(elements, "main");

  writePosts("index.html", filledTemplate, srcPath);
}

function main() {
  const postsPath = path.join(__dirname, "posts");
  const distPath = path.join(__dirname, "dist");
  const parsedPostsPath = path.join(distPath, "posts");
  const configFilePath = path.join(__dirname, "config.yaml");
  const templatesPath = path.join(__dirname, "templates");

  if (!fs.existsSync(templatesPath)) {
    throw new Error("Templates folder does not exist.");
  }

  if (!fs.existsSync(configFilePath)) {
    throw new Error("The config file (config.yml) does not exist.");
  }

  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true });
  }
  fs.mkdirSync(distPath);
  fs.mkdirSync(parsedPostsPath);

  if (!fs.existsSync(postsPath)) {
    fs.mkdirSync(postsPath);
  }

  const configData = parseConfigFile(configFilePath);

  parseMarkdownPosts(postsPath, parsedPostsPath, configData);
  generateMainPage(distPath, configData, postsPath);
}

main();
