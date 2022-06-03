const { Command } = require("reconlx");
const fs = require("fs");

let handlerCount = 0;
let eventCount = 0;

module.exports = new Command({
  name: 'reload',
  aliases: [],
  description: `reloads a command file or all files`,
  usage: 'PREFIX Command: reload',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: "Owner-Only",
  slashCommand: false,
  prefixCommand: true,

  run: async(client, message) => {
    //need to add command reload function & function reload function (xd)

    if (!message.args || message.args.length == 0) {
      client.log("Reloading Handlers...");
      fs.readdirSync("./../Handlers").filter(file => file.endsWith('_handler.js')).forEach(file => {
        delete require.cache[require.resolve(`../../Handlers/${file}`)];
        require(`./../Handlers/${handler}`)(client);

        const handlerName = file.split(".")[0];
        client.log(`Reloaded Handler ${handlerName}`);
        handlerCount++
      });
      client.log(`Reloaded ${handlerCount} Handlers\n`)

      client.log('Reloading Events...')
      fs.readdirSync("./../Events").filter(file => file.endsWith('.js')).forEach(file => {
        delete require.cache[require.resolve(`../../Events/${file}`)];
        const event = require(`../../Events/${file}`);
        const eventName = file.split(".")[0];

        client.events.delete(eventName);
        client.events.set(eventName, event);
        client.log(`Reloaded Event ${eventName}`);
        eventCount++
      });
      client.log(`Reloaded ${eventCount} Events\n`)

      return client.functions.reply(`Reloaded \`${handlerCount}\` handlers, \`${commandCount}\`, \`${slashCommandCount}\` commands and \`${eventCount}\` events.`, message)
    };

    var commandName = message.args[0].split('/');
    if (!client.commands.has(commandName[commandName.length - 1])) {
      return client.functions.reply(`The command \`${commandName[commandName.length - 1]}\` does not exist!`, message)
    }

    delete require.cache[require.resolve(`./${commandName}.js`)];
    client.commands.delete(commandName);

    const command = require(`./${message.args[0]}.js`);
    client.commands.set(commandName, command);

    client.log(`Reloaded command ${commandName}`)
    client.functions.reply(`The command \`${commandName}\` has been reloaded.`, message)
  }

})