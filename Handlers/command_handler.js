const { readdirSync } = require('fs');
let commandCount = 0;

module.exports = ({ botType, commands, log }) => {
  for (const subFolder of getDirectoriesSync('./Commands')) {
    for (const file of readdirSync(`./Commands/${subFolder}`).filter(file => file.endsWith('.js'))) {
      const command = require(`../Commands/${subFolder}/${file}`);

      if (!command.prefixCommand || command.disabled /*|| (botType == 'dev' && !command.beta)*/) continue;

      commands.set(command.name, command);
      log(`Loaded Command ${command.name}`);
      commandCount++

      if (!command.aliases) continue;
      for (const alias of command.aliases.prefix) {
        commands.set(alias, command);
        log(`Loaded Alias ${alias} of command ${command.name}`);
        commandCount++
      }
    }
  }

  log(`Loaded ${commandCount} commands\n`);
}