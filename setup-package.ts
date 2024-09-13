/** 
 *
 * setup-package.js
 *
 * This file is used by publish system to build a clean npm package with the compiled js files in the root of the package.
 * It will not be included in the npm package.
 * 
 **/

import fs from 'fs';

// This script is called from within the build folder. It is important to include it in .npmignore, so it will not get published. 
const sourceDirectory = ".";
const destinationDirectory = "./build";

function main() {
  // Generate publish-ready package.json
  const source = fs.readFileSync(__dirname + "/package.json").toString("utf-8");
  const sourceObj = JSON.parse(source);
  sourceObj.scripts = {};
  sourceObj.devDependencies = {};
  fs.writeFileSync(`${destinationDirectory}/package.json`, Buffer.from(JSON.stringify(sourceObj, null, 2), "utf-8"));

  // Copy additional files from source to destination
  const filesToOverwrite = ["strapi-admin.js", "strapi-server.js"];
  const filesToCopy = ["README.md", "LICENSE.md", ".npmignore", ...filesToOverwrite];
  filesToCopy.forEach(file => fs.copyFileSync(`${sourceDirectory}/${file}`, `${destinationDirectory}/${file}`));

  // Replace imports in core files in build folder
  filesToOverwrite.forEach(file => fs.readFile(`${destinationDirectory}/${file}`, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    var result = data.replace(/build\//g, '');
  
    fs.writeFile(`${destinationDirectory}/${file}`, result, 'utf8', function (err) {
       if (err) return console.log(err);
    });
  }));
}

main();
