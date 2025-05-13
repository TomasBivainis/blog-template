<h1 align="center"> 
  Hyde
</h1>

<p align="center"> 
  <strong>Create your blog faster.</strong><br> 
  Use what you already know and focus on writing.
</p>

<p align="center">
  <a href="https://github.com/TomasBivainis/hyde/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="visualsort is released under the MIT license." />
  </a>
  <a href="https://x.com/tomasbivainis">
    <img src="https://img.shields.io/twitter/url?url=https%3A%2F%2Fx.com%2Ftomasbivainis&label=Follow%20me" alt="Follow @tomasbivainis" />
  </a>
</p>

<p align="center">
  Hyde is a simple-to-use, minimalist blog static site generator in Node.js and JavaScript.
</p>

## Installation

To use this template, fork it and clone it to your computer.

## How to use

Write posts in markdown in the `posts` folder. The name of the file is the name of the post, the `_` symbol should be used instead of spaces in the file name. They will be replace with spaces in the blog.

The contents of the markdown file consists of 2 parts: the data and the post. The data is at the start of the file separated by `---` from front and back. The data must contain the date, which can be enter in this format: `date: yyyy-mm-dd`. The rest of the file is just the content of the blog post.

If you want an example of a blog post, check out the given example posts in the `posts` folder.

Keep in mind, when generating the site, the framework scans the `posts` folder non-recursively. Meaning that markdown posts kept in a folder inside `posts` will not be generated. Files that are not markdown files (files whose extensions are not `.md`) will also be ignored.

## Customisation

If you would like to change the style of the website, you can change the css style sheet which you can find in the directory `styles/style.css`. It is linked to every HTML file.

To change the structure of the website or understand what the structure of the blog is, you can check out the template files inside the `templates` folder. Be aware, that words surrounded by curly braces are considered variables which will be replaced by their content when generating the website (e.g. `{variable}`). If you want to just use the curly braces, you can escape them with `\` (e.g. `\{not a variable}`).

## Inspiration

This project was inspired by [Jekyll](https://github.com/jekyll/jekyll). Credit to all the people who have worked on it.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Issues

For issues, please open a [GitHub issue](https://github.com/TomasBivainis/hyde/issues).
