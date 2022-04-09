const { Command } = require("reconlx");

module.exports = new Command({
  name: 'reload',
  aliases: [],
  description: `reloads a command file or all files`,
  userPermissions: [],
  category : "Owner-Only",
  slashCommand: false,
  disabled: true,
  run: async (client, message, interaction) => {
    
    let permissionGranted = await client.functions.checkBotOwner(client, message)
    if(!permissionGranted) return;
  
    const fs = require("fs");
    const path = require("path");

    if (!message.args || message.args.length === 0) {
      var commandCount = 0
      console.log("Reloading Commands...")

      function registerCommands(path = './../Commands') {
        const allCommands = fs.readdirSync(path);
        for (const command of allCommands) {
          if(fs.statSync(`${path}/${command}`).isDirectory()) {
            registerCommands(`${path}/${command}`);
            continue;
          }

          const loadedCommand = require(`.${path}/${command}`);
          client.commands.set(loadedCommand.name, loadedCommand);
            
          for(const alias of loadedCommand.aliases || []) {
            commands.set(alias, { ...loadedCommand, alias: true });
            console.log(`Loaded command ${loadedCommand.name} (${path}/${command})`);
          }
          commandCount++
        }
      }
      registerCommands();
      console.log(`Reloaded ${commandCount} commands\n`)

      console.log('Reloading events...')
      var eventCount = 0
      const events = fs.readdirSync("../../Teufelswerk-Bot/Events").filter(file => file.endsWith(".js"));
      for (const file of events) {
        eventCount++
        const eventName = file.split(".")[0];

        console.log(`Reloading event ${eventName}...`);

        delete require.cache[require.resolve(`../../Teufelswerk-Bot/Events/${eventName}`)];
        const event = require(`../../Teufelswerk-Bot/Events/${file}`);

        client.off(eventName, event.bind(null, client));
        client.on(eventName, event.bind(null, client));
      }
      console.log(`Reloaded ${eventCount} events\n`)

      return client.functions.reply(`Reloaded \`${commandCount}\` commands and \`${eventCount}\` events.`, message)
    }
  
    var command = message.args[0]
    var commandName = message.args[0].split('/')
    if (!client.commands.has(commandName[commandName.length - 1])) {
      return client.functions.reply(`The command \`${commandName[commandName.length -1]}\` does not exist!`, message)
    }

    delete require.cache[require.resolve(`./${commandName}.js`)];
    client.commands.delete(commandName);

    var command = require(`./${command}.js`);
    client.commands.set(commandName, command);

    console.log(`Reloaded command ${commandName}`)
    client.functions.reply(`The command \`${commandName}\` has been reloaded.`, message)
  }
  
})