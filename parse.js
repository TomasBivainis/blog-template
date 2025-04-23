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

  return properties;
}

function fillTemplate(properties) {
  const templateName = properties["template"] || "post";
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
  Object.keys(properties).forEach((key) => {
    const placeholder = new RegExp(`<[a-z0-9]* id="${key}"></[a-z0-9]*>`, "g");
    templateContent = templateContent.replace(placeholder, (match) => {
      return match.replace("><", `>${properties[key]}<`);
    });
  });

  return templateContent;
}

function writePosts(properties) {
  console.log(properties);
  const postName = properties["name"];
  const filledTemplate = fillTemplate(properties);

  console.log(postName);

  fs.writeFileSync(path.join(compilePostsFolder, postName), filledTemplate);
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
      const content = splitData[2].trim();

      const properties = parseMetadata(meta);
      properties["name"] = file.split(".")[0] + ".html";
      properties["title"] = file.split(".")[0].replaceAll("_", " ");
      properties["content"] = marked(content);

      writePosts(properties);
    });
  });
}

function clearPosts() {
  const files = fs.readdirSync(compilePostsFolder);

  files.forEach((file) => {
    fs.rmSync(path.join(compilePostsFolder, file));
  });
}

function checkForPostsFolder() {
  if (!fs.existsSync(compilePostsFolder)) {
    fs.mkdirSync(compilePostsFolder);
  }
}

//TODO: implement check for posts folder
function main() {
  checkForPostsFolder();
  clearPosts();
  parseMarkdown();
}

main();
