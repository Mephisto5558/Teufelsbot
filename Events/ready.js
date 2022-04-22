module.exports = async (client) => {
  client.guilds.cache.forEach(guild => {
    if(!client.guildWhitelist.includes(guild.id)) {
      guild.leave();
      console.log(`Left ${guild.name}(${guild.id}) because it's not in the whitelist`);
    }
  });

  const { Client } = require("discord-slash-commands-client");
  const commandClient = new Client(
    process.env.token,
    client.userID
  );

  function work(option) {
    if(!option.type) option.type = 1
    option.type = option.type.toString()
      .replace('SUB_COMMAND',	1).replace('SUB_COMMAND_GROUP',	2)
      .replace('STRING', 3).replace('INTEGER',	4)
      .replace('BOOLEAN',	5).replace('USER', 6)
      .replace('CHANNEL',	7).replace('ROLE',	8)	
      .replace('MENTIONABLE',	9).replace('NUMBER', 10)
      .replace('ATTACHMENT', 11)
  }

  for await (command of client.slashCommandList) {
    if(Array.isArray(command.options)) command.options.forEach((option) => { work(option) });
    else if(command.options) work(command.options);

    await commandClient
      .createCommand({
        name: command.name,
        description: command.description,
        options: command.options
      })
      .then( console.log(`Registered Slash Command ${command.name}`) )
      .catch( console.error);
    await client.functions.sleep(10000);
  };
  
  console.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c)} users.\n`);
  await client.functions.sleep(20000)
  client.user.setActivity({ name: "no one found the easter egg yet! | /help", type: "PLAYING" });
}