const fs = require('fs');
let commandCount = 0;

module.exports = client => {

  fs.readdirSync('./Commands').forEach(subFolder => {
    fs.readdirSync(`./Commands/${subFolder}/`).filter(file => file.endsWith(".js")).forEach(file => {
      let command = require(`../Commands/${subFolder}/${file}`);
      if(!command.prefixCommand || command.disabled || (client.botType == 'dev' && !command.beta)) return;

      client.commands.set(command.name, command);
      client.log(`Loaded Command ${command.name}`)
      commandCount++

      if(command.aliases) {
        command.aliases.forEach(alias => {
          client.aliases.set(alias, command.name);
          client.log(`Loaded Alias ${alias} of command ${command.name}`);
          commandCount++
        })
      }
    })
  });
  client.log(`Loaded ${commandCount} commands\n`)

}