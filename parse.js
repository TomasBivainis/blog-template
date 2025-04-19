const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const postsFolder = path.join(__dirname, "posts");
const compilePostsFolder = path.join(__dirname, "src", "_posts");

function parseMarkdown() {
  fs.readdir(postsFolder, (err, files) => {
    if (err) {
      return console.error("Unable to scan directory", err);
    }

    files.forEach((file) => {
      const data = fs.readFileSync(path.join(postsFolder, file), "utf8");

      const new_name = file.split(".")[0] + ".html";

      fs.writeFileSync(path.join(compilePostsFolder, new_name), marked(data));
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
