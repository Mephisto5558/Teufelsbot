const { readdirSync } = require('fs');
let commandCount = 0;

module.exports = function commandHandler() {
  for (const subFolder of getDirectoriesSync('./Commands')) {
    for (const command of readdirSync(`./Commands/${subFolder}`)
      .filter(e => e.endsWith('.js'))
      .map(e => require(`../Commands/${subFolder}/${e}`))
      .filter(e => e.prefixCommand && !e.disabled && !(this.botType == 'dev' && !e.beta))
    ) {
      this.prefixCommands.set(command.name, command);
      this.log(`Loaded Prefix Command ${command.name}`);
      commandCount++;

      if (!command.aliases) continue;
      for (const alias of command.aliases.prefix) {
        this.prefixCommands.set(alias, { ...command, aliasOf: command.name });
        this.log(`Loaded Alias ${alias} of Prefix Command ${command.name}`);
        commandCount++;
      }
    }
  }

  this.log(`Loaded ${commandCount} Prefix Commands\n`);
};