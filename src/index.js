import "./style.css";

const fs = require("fs");
const path = require("path");
const postsDir = "posts";

fs.readdirSync(postsDir, (err, files) => {
  if (err) {
    return console.error("No posts.", err);
  }

  files.forEach((file) => {

  });
});

function