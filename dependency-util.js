const fs = require("fs");
const dependencies=JSON.parse(fs.readFileSync("./package.json").toString()).dependencies;
console.log(Object.keys(dependencies).join(" "));