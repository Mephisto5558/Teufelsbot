module.exports = (client) => {
  const fs = require('fs');
  var functionCount = 0;

  fs.readdirSync("./Functions").filter(file => file.endsWith(".js")).forEach(file => {
    const functionName = file.split(".")[0];
    const functionFile = require(`../Functions/${file}`);
    client.functions[functionName] = functionFile
    console.log(`Loaded Function ${functionName}`);
    functionCount++
  });
  console.log(`Loaded ${functionCount} functions\n`)
}