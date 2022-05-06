const fs = require('fs');
let functionCount = 0;

module.exports = client => {
  fs.readdirSync("./Functions/global").filter(file => file.endsWith(".js")).forEach(file => {
    const functionName = file.split(".")[0];
    const functionFile = require(`../Functions/global/${file}`);

    client.functions[functionName] = functionFile
    console.log(`Loaded Global Function ${functionName}`);
    functionCount++
  });

  console.log(`Loaded ${functionCount} Global Functions\n`)
}