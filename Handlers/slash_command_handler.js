module.exports = (client) => {
  const fs = require('fs');
  let commandCount = 0;
  
  fs.readdirSync("./Commands").forEach(cmd => {
    let commands = fs.readdirSync(`./Commands/${cmd}/`).filter((file) => file.endsWith(".js")).forEach((file) => {
      let pull = require(`../Commands/${cmd}/${file}`);
      if(pull.slashCommand) {
        client.slashCommandList.push(pull) 
        console.log(`Loaded Slash Command ${pull.name}`)
        commandCount++
      }
    })
  });

  const { Client } = require("discord-slash-commands-client");
  const commandClient = new Client(
    process.env.token,
    client.userID
  );
  
  client.guilds.cache.forEach(guild => {
    commandClient.getCommands({guildID: guild.id}).then(console.log());
    try {     
      guild.commands.set(client.slashCommandList);
    } catch(error) {console.log(error)}
  });
  
  console.log(`Loaded ${commandCount} Slash commands\n`)
}