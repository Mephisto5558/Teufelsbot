const { readdirSync } = require('fs');
let commandCount = 0;

module.exports = client => {

  for (const subFolder of readdirSync('./Commands')) {
    for (const file of readdirSync(`./Commands/${subFolder}`).filter(file => file.endsWith('.js'))) {
      const command = require(`../Commands/${subFolder}/${file}`);

      if (!command.prefixCommand || command.disabled || (client.botType == 'dev' && !command.beta)) continue;

      client.commands.set(command.name, command);
      client.log(`Loaded Command ${command.name}`);
      commandCount++

      if (!command.aliases) continue;
      for (const alias of command.aliases) {
        client.commands.set(alias, command);
        client.log(`Loaded Alias ${alias} of command ${command.name}`);
        commandCount++
      }
    }
  }

  client.log(`Loaded ${commandCount} commands\n`)

}