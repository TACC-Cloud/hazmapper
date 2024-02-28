/* eslint-disable */

module.exports = {
  plugins: [
    require('postcss-nesting'),
    require('postcss-preset-env')({
      stage: false,
      features: {
        'custom-media-queries': true,
        'media-query-ranges': true,
        'custom-selectors': true,
      },
    }),
    require('postcss-replace')({
      pattern: 'fonts/',
      data: {
        replaceAll: '../fonts/',
      },
    }),
  ],
};
