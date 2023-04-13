module.exports = {
  plugins: [
    "stylelint-stylus",
  ],
  // makes the stylus files parseable.
  overrides: [
    {
      files: ["*.stylus", "*.styl", "**/*.stylus", "**/*.styl"],
      customSyntax: "postcss-styl",
    },
  ],
  rules: {
    // add rules settings here, such as:
    "stylus/declaration-colon": "never",
    "stylus/pythonic": "always",
    "stylus/selector-list-comma": "never",
    "stylus/semicolon": "never",
    "stylus/single-line-comment": "always",
  },
};
