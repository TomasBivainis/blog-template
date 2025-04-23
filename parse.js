const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const postsFolder = path.join(__dirname, "posts");
const compilePostsFolder = path.join(__dirname, "src", "posts");

function parseMetadata(meta) {
  const properties = {};

  meta.split("\n").forEach((line) => {
    const [key, value] = line.split(": ");
    properties[key] = value;
  });

  console.log(properties);

  let postName;

  if (properties["name"] === undefined) {
    postName = file.split(".")[0];
  } else {
    nampostNamee = properties["name"];
  }

  postName += ".html";

  let templateName;

  if (properties["template"] === undefined) {
    templateName = "post";
  } else {
    templateName = properties["template"];
  }

  let postDate = properties["date"];

  let categories = [];

  if (properties["categories"] !== undefined) {
    properties["categories"].split(", ").forEach((category) => {
      categories.add(category);
    });
  }

  return properties;
}

function parseMarkdown() {
  fs.readdir(postsFolder, (err, files) => {
    if (err) {
      return console.error("Unable to scan directory", err);
    }

    files.forEach((file) => {
      const fileText = fs.readFileSync(path.join(postsFolder, file), "utf8");
      const splitData = fileText.split("---\n");

      const meta = splitData[1].trim();
      const data = splitData[2].trim();

      const properties = parseMetadata(meta);

      fs.writeFileSync(path.join(compilePostsFolder, postName), marked(data));
    });
  });
}

function clearPosts() {
  const files = fs.readdirSync(compilePostsFolder);

  files.forEach((file) => {
    fs.rmSync(path.join(compilePostsFolder, file));
  });
}

//TODO: implement check for _posts folder
function main() {
  clearPosts();
  parseMarkdown();
}

main();
