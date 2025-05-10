const fs = require("fs");
const path = require("path");
const yaml = require("yaml");
const { marked } = require("marked");
const {
  parseMetadata,
  wrapContent,
  fillTemplate,
  parsePostTitle,
  convertDate,
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
  const posts = [];

  const files = fs.readdirSync(postsFolder);

  files.forEach((file) => {
    const post = {};

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
    elements["date"] = convertDate(postMetaData["date"]);
    elements["catagories"] = postMetaData["catagories"];
    elements["header"] = postMetaData["title"];

    post["title"] = elements["postTitle"];
    post["date"] = postMetaData["date"];

    const parsedContent = fillTemplate(elements, postMetaData["template"]);

    posts.push(post);

    writePosts(postMetaData["name"], parsedContent, parsedPostsFolder);
  });

  return posts;
}

/*
 * Parses the data from the config file and returns it as a map.
 */
function parseConfigFile(configFilePath) {
  const file = fs.readFileSync(configFilePath, "utf-8");
  const data = yaml.parse(file);

  return data;
}

function generateMainPage(srcPath, configData, posts) {
  const elements = {};

  elements["title"] = configData["title"];
  elements["description"] = configData["description"];

  elements["posts"] = generatePostsElement(posts);

  const filledTemplate = fillTemplate(elements, "main");

  writePosts("index.html", filledTemplate, srcPath);
}

function generatePostsElement(posts) {
  let postsElement = "";

  posts.forEach((post) => {
    postsElement += `
      <a href="posts/${post["title"].replace(" ", "_")}.html">
        <div class="title">${post["title"]}</div>
        <div class="date">${convertDate(post["date"])}</div>
      </a>`;
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

  const posts = parseMarkdownPosts(postsPath, parsedPostsPath, configData);

  posts.sort((x, y) => {
    if (x["date"] < y["date"]) {
      return 1;
    } else if (x["date"] > y["date"]) {
      return -1;
    }
    return 0;
  });

  generateMainPage(distPath, configData, posts);
  copyStyles(stylesPath, distPath);
}

main();
