const fs = require('fs');
let functionCount = 0;

module.exports = client => {
  for(const file of fs.readdirSync('./Functions/global').filter(file => file.endsWith('.js'))) {
    const functionName = file.split('.')[0];

    client.functions[functionName] = require(`../Functions/global/${file}`);
    client.log(`Loaded Global Function ${functionName}`);
    functionCount++
  }

  client.log(`Loaded ${functionCount} Global Functions\n`)
}