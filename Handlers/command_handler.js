const fs = require('fs');
let commandCount = 0;

module.exports = client => {

  fs.readdirSync('./Commands').forEach(subFolder => {
    fs.readdirSync(`./Commands/${subFolder}/`).filter(file => file.endsWith(".js")).forEach(file => {
      let command = require(`../Commands/${subFolder}/${file}`);
      if (!command.prefixCommand || command.disabled) return;

      client.commands.set(command.name, command);
      console.log(`Loaded Command ${command.name}`)
      commandCount++

      if (command.aliases) {
        command.aliases.forEach(alias => {
          client.aliases.add(alias, command.name);
          console.log(`Loaded Alias ${alias} of command ${command.name}`);
          commandCount++
        })
      }
    })
  });
  console.log(`Loaded ${commandCount} commands\n`)
  
}