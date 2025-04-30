const fs = require("fs");
const path = require("path");
const yaml = require("yaml");
const { marked } = require("marked");
const { labas, lobos } = require("./util/module");

/*
 * Parses the given metadata for post specific data.
 */
function parseMetadata(rawMetaData, postMetaData) {
  rawMetaData.split("\n").forEach((line) => {
    const [key, value] = line.split(": ");
    postMetaData[key] = value;
  });
}

/*
 * Wraps the given content with the given type of HTML
 * element and gives it the given id.
 */
function wrapContent(content, element, id = "") {
  return `<${element} id="${id}">${content}</${element}>`;
}

/*
 * Fills the given template with the elements
 * given.
 */
function fillTemplate(elements, template = "post") {
  const templateName = template || "post";

  const templatePath = path.join(
    __dirname,
    "templates",
    `${templateName}.html`
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template "${templateName}" not found.`);
  }

  let templateContent = fs.readFileSync(templatePath, "utf8");

  // Replace placeholders in the template with values from properties
  Object.keys(elements).forEach((key) => {
    const placeholder = new RegExp(`<${key}*(.+)*/>`, "gi");
    templateContent = templateContent.replace(placeholder, (match) => {
      return elements[key];
    });
  });

  return templateContent;
}

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
function parseMarkdown(postsFolder, parsedPostsFolder, blogConfig) {
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
function clearPosts(parsedPostsFolder) {
  const files = fs.readdirSync(parsedPostsFolder);

  files.forEach((file) => {
    fs.rmSync(path.join(parsedPostsFolder, file));
  });
}

// ? this does not seem good
function checkFolders(postsPath, compilePostsFolder, configFilePath) {
  if (!fs.existsSync(compilePostsFolder)) {
    fs.mkdirSync(compilePostsFolder);
  }

  if (!fs.existsSync(postsPath)) {
    fs.mkdirSync(postsPath);
  }

  if (!fs.existsSync(configFilePath)) {
    fs.mkdirSync(configFilePath);
    //throw new Error("Emtpy configuration file.");
  }
}

// ? redo if you change the check folder
function parseConfigFile(configFilePath) {
  // ? is it necessary? think about it
  if (!fs.existsSync(configFilePath)) {
    throw new Error("The config file (config.yml) does not exist.");
  }

  const file = fs.readFileSync(configFilePath, "utf-8");
  const data = yaml.parse(file);

  return data;
}

function main() {
  const postsPath = path.join(__dirname, "posts");
  const parsedPostsPath = path.join(__dirname, "src", "posts");
  const configFilePath = path.join(__dirname, "config.yaml");

  checkFolders(postsPath, parsedPostsPath, configFilePath); // ?

  const configData = parseConfigFile(configFilePath); // ?

  clearPosts(parsedPostsPath);

  parseMarkdown(postsPath, parsedPostsPath, configData);
}

main();
