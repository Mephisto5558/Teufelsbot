const fs = require('fs');

module.exports = client => {
  let commandCount = 0;

  fs.readdirSync("./Commands").forEach(subFolder => {
    fs.readdirSync(`./Commands/${subFolder}/`).filter(file => file.endsWith(".js")).forEach(file => {
      let pull = require(`../Commands/${subFolder}/${file}`);
      if (!pull.prefixCommand || !pull.name) return;

      if (pull.disabled) return console.log(`Command ${pull.name} is disabled`);
      client.commands.set(pull.name, pull);
      console.log(`Loaded Command ${pull.name}`)
      commandCount++

      if (pull.aliases) {
        pull.aliases.forEach(alias => {
          client.aliases.set(alias, pull.name);
          console.log(`Loaded Alias ${alias} of command ${pull.name}`);
          commandCount++
        })
      }
    })
  });

  console.log(`Loaded ${commandCount} commands\n`)
}