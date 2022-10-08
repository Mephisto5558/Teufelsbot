const { readdirSync } = require('fs');
let functionCount = 0;

module.exports = function functionHandler() {
  for (const file of readdirSync('./Functions/global').filter(e => e.endsWith('.js'))) {
    const functionName = file.split('.')[0];

    this.functions[functionName] = require(`../Functions/global/${file}`).bind(this);
    this.log(`Loaded Global Function ${functionName}`);
    functionCount++;
  }

  this.log(`Loaded ${functionCount} Global Functions\n`);
};