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

  // Use a regex to match all combinations of escape characters and placeholders
  templateContent = templateContent.replace(
    /(\\*){([^}]+)}/g,
    (match, backslashes, key) => {
      const numBackslashes = backslashes.length;

      if (numBackslashes % 2 === 0) {
        // Even number of backslashes: treat as unescaped placeholder
        const value = elements[key] || `{${key}}`;
        return backslashes.slice(0, numBackslashes / 2) + value;
      } else {
        // Odd number of backslashes: treat as escaped placeholder
        return (
          backslashes.slice(0, Math.floor(numBackslashes / 2)) + `{${key}}`
        );
      }
    }
  );

  return templateContent;
}

/*
 * Takes the file name and returns the name of the post.
 */
function parsePostTitle(fileName) {
  return fileName.split(".")[0].replace("_", " ");
}

/*
 * Converts the typical "yyyy-mm-dd" date format to "{month's first 3 letters} dd, yyyy" date format.
 */
function convertDate(date) {
  date = date.split("-");

  const year = parseInt(date[0]);
  let month = parseInt(date[1]);
  const day = parseInt(date[2]);

  switch (month) {
    case 1:
      month = "Jan";
      break;
    case 2:
      month = "Feb";
      break;
    case 3:
      month = "Mar";
      break;
    case 4:
      month = "Apr";
      break;
    case 5:
      month = "May";
      break;
    case 6:
      month = "Jun";
      break;
    case 7:
      month = "Jul";
      break;
    case 8:
      month = "Aug";
      break;
    case 9:
      month = "Sep";
      break;
    case 10:
      month = "Oct";
      break;
    case 11:
      month = "Nov";
      break;
    case 12:
      month = "Dec";
      break;
    default:
      throw new Error("Invalid month number");
  }

  return `${month} ${day}, ${year}`;
}

module.exports = {
  parseMetadata,
  wrapContent,
  fillTemplate,
  parsePostTitle,
  convertDate,
};
