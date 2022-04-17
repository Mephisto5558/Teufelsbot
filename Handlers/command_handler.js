module.exports = (client) => {
  const fs = require('fs');
  let commandCount = 0;
  
  fs.readdirSync("./Commands").forEach(cmd => {
    let commands = fs.readdirSync(`./Commands/${cmd}/`).filter((file) => file.endsWith(".js")).forEach((file) => {
      let pull = require(`../Commands/${cmd}/${file}`);
      if(pull.disabled) return console.log(`Command ${pull.name} is disabled`);
      if(pull.name) {
        client.commands.set(pull.name, pull);
        console.log(`Loaded Command ${pull.name}`)
        commandCount++
      }
      if(pull.aliases) {
        pull.aliases.forEach(alias => {
          client.aliases.set(alias, pull.name)
          console.log(`Loaded Command ${alias} (alias of ${pull.name})`)
        })
      }
    })
  });
  console.log(`Loaded ${commandCount} commands\n`)
  return commandCount;
}