/** @type {import("prettier").Config} */
const config = {
  // default options (explicitly set options)
  printWidth: 80,
  trailingComma: "all",
  singleQuote: false,
  semi: true,
  arrowParens: "always",

  // plugins
  plugins: ["prettier-plugin-sh"],
};

export default config;
