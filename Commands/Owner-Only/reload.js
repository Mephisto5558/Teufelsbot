const { Command } = require("reconlx");

module.exports = new Command({
  name: 'reload',
  aliases: [],
  description: `reloads a command file or all files`,
  userPermissions: [],
  category : "Owner-Only",
  slashCommand: false,
  run: async (client, message, interaction) => {
    
    let permissionGranted = await client.functions.checkBotOwner(client, message)
    if(!permissionGranted) return;
  
    const fs = require("fs");
    const path = require("path");

    if (!message.args || message.args.length === 0) {
      console.log("Reloading Handlers...");
      var handlerCount = 0;
      fs.readdirSync("./../Handlers").filter((file) => file.endsWith("_handler.js")).forEach((file) => {
        delete require.cache[require.resolve(`../../Handlers/${file}`)];
        require(`./../Handlers/${handler}`)(client);
        handlerCount++
      });
      console.log(`Reloaded ${handlerCount} handlers\n`)

      console.log('Reloading events...')
      var eventCount = 0
      fs.readdirSync("./../Events").filter(file => file.endsWith(".js")).forEach((file) => {
        delete require.cache[require.resolve(`../../Events/${file}`)];
        const event = require(`../../Events/${file}`);

        const eventName = file.split(".")[0];

        client.events.delete(eventName)
        client.events.set(eventName, event);
        console.log(`Reloaded Event ${eventName}`);
        eventCount++
      });
      console.log(`Reloaded ${eventCount} events\n`)

      return client.functions.reply(`Reloaded \`${handlerCount}\` handlers, \`${commandCount}\`, \`${slashCommandCount}\` commands and \`${eventCount}\` events.`, message)
    };
  
    var commandName = message.args[0].split('/');
    if (!client.commands.has(commandName[commandName.length - 1])) {
      return client.functions.reply(`The command \`${commandName[commandName.length -1]}\` does not exist!`, message)
    }

    delete require.cache[require.resolve(`./${commandName}.js`)];
    client.commands.delete(commandName);

    var command = require(`./${message.args[0]}.js`);

    console.log(`Reloaded command ${commandName}`)
    client.functions.reply(`The command \`${commandName}\` has been reloaded.`, message)
  }
  
})