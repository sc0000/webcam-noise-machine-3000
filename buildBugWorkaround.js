// ! This is a dirty workaround for what appears to be a create-react-app bug, see https://github.com/facebook/create-react-app/issues/12503

const fs = require('fs-extra');

const filesToCopy = [
  '561.97f8ec56.chunk.js',
  '561.97f8ec56.chunk.js.map',
];

filesToCopy.forEach((f) => fs.copySync(`build/static/js/${f}`, `build/static/js/static/js/${f}`));
