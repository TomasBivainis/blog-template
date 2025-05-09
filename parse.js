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

      elements["title"] = blogConfig["title"];
      elements["postTitle"] = file.split(".")[0].replaceAll("_", " ");
      elements["content"] = marked(content);
      elements["date"] = postMetaData["date"];
      elements["catagories"] = postMetaData["catagories"];
      elements["header"] = postMetaData["title"];

      const parsedContent = fillTemplate(elements, postMetaData["template"]);

      writePosts(postMetaData["name"], parsedContent, parsedPostsFolder);
    });
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

  elements["title"] = configData["title"];
  elements["description"] = configData["description"];

  elements["posts"] = generatePostElement(postsPath);

  const filledTemplate = fillTemplate(elements, "main");

  writePosts("index.html", filledTemplate, srcPath);
}

function generatePostElement(postsPath) {
  let postsElement = "";

  const files = fs.readdirSync(postsPath);

  files.forEach((file) => {
    let postElement = `<a href="posts/${
      file.split(".")[0]
    }.html">${parsePostTitle(file)}</a>`;

    postsElement += postElement;
  });

  return postsElement;
}

function copyStyles(stylesPath, distPath) {
  fs.readdir(stylesPath, (err, files) => {
    if (err) {
      throw new Error(err);
    }

    files.forEach((file) => {
      fs.copyFileSync(path.join(stylesPath, file), path.join(distPath, file));
    });
  });
}

function main() {
  const postsPath = path.join(__dirname, "posts");
  const distPath = path.join(__dirname, "dist");
  const parsedPostsPath = path.join(distPath, "posts");
  const configFilePath = path.join(__dirname, "config.yaml");
  const templatesPath = path.join(__dirname, "templates");
  const stylesPath = path.join(__dirname, "styles");

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

  if (!fs.existsSync(stylesPath)) {
    fs.mkdirSync(stylesPath);
  }

  const configData = parseConfigFile(configFilePath);

  parseMarkdownPosts(postsPath, parsedPostsPath, configData);
  generateMainPage(distPath, configData, postsPath);
  copyStyles(stylesPath, distPath);
}

main();
