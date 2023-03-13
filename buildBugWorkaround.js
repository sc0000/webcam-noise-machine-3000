const fs = require('fs-extra');

const filesToCopy = [
  '561.97f8ec56.chunk.js',
  '561.97f8ec56.chunk.js.map',
];

filesToCopy.forEach((f) => fs.copySync(`build/static/js/${f}`, `build/static/js/static/js/${f}`));
