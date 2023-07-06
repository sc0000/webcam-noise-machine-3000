// ! This is a dirty workaround for what appears to be a create-react-app bug, see https://github.com/facebook/create-react-app/issues/12503

const fs = require('fs-extra');
const path = require('path');

const jsDir = path.join('build', 'static', 'js');

const filesInDir = fs.readdirSync(jsDir);

const filesToCopy = filesInDir.filter((file) => {
  return (file.endsWith('.js') || file.endsWith('.js.map')) && file.includes('.chunk');
});

filesToCopy.forEach((f) => {
  fs.copySync(path.join(jsDir, f), path.join(jsDir, 'static', 'js', f));
});