const { readdirSync } = require('fs');
let functionCount = 0;

module.exports = ({ functions, log }) => {
  for (const file of readdirSync('./Functions/global').filter(e => e.endsWith('.js'))) {
    const functionName = file.split('.')[0];

    functions[functionName] = require(`../Functions/global/${file}`);
    log(`Loaded Global Function ${functionName}`);
    functionCount++
  }

  log(`Loaded ${functionCount} Global Functions\n`)
}