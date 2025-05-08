const path = require("path");
const fs = require("fs");

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
function fillTemplate(elements, template) {
  const templateName = template || "post";

  const templatePath = path.join(
    __dirname,
    "..",
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

function parsePostTitle(fileName) {
  return fileName.split(".")[0].replace("_", " ");
}

module.exports = {
  parseMetadata,
  wrapContent,
  fillTemplate,
  parsePostTitle,
};
