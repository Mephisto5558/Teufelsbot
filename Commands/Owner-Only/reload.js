const
  { Command } = require('reconlx'),
  { readdirSync, existsSync } = require('fs'),
  { join } = require('path')

async function reloadCommand(client, commandName, path, reloadedArray) {
  commandName = commandName.replace('.js', '');

  delete require.cache[path];
  const file = require(path);

  if (client.botType == 'dev' ? !file.beta : file.disabled) return;

  if (file.prefixCommand) {
    client.commands.delete(commandName);
    client.commands.set(commandName, file);

    reloadedArray.push(commandName);

    for (const alias of file.aliases.prefix) {
      client.commands.delete(alias, file);
      client.commands.set(alias, file);

      reloadedArray.push(alias);
    }
  }

  if (file.slashCommand) {
    client.slashCommands.delete(commandName);
    client.slashCommands.set(commandName, file);

    reloadedArray.push(`/${commandName}`);

    for (const alias of file.aliases.slash) {
      client.slashCommands.delete(alias, file);
      client.slashCommands.set(alias, file);

      reloadedArray.push(`/${alias}`);
    }
  }
}

module.exports = new Command({
  name: 'reload',
  aliases: { prefix: [], slash: [] },
  description: 'reloads a command file or all files',
  usage: 'PREFIX Command: reload <category | "*"> <command | "*">',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: async (message, client) => {
    const category = !message.args[0] ? null : message.args[0] == '*' ? '*' : getDirectoriesSync('./Commands').filter(e => e.toLowerCase() == message.args[0].toLowerCase())?.[0];
    const command = !message.args[1] ? null : message.args[1] == '*' ? '*' : readdirSync(`./Commands/${category}`).filter(e => e.endsWith('.js') && e.toLowerCase() == `${message.args[1].toLowerCase()}.js`)?.[0];
    const path = join(__dirname, `../../Commands/${category}/${command}`);

    let errorMsg, reloadedArray = [];

    try {
      if (category == '*') {
        for (const subFolder of getDirectoriesSync('./Commands'))
          for (const file of readdirSync(`./Commands/${subFolder}`).filter(file => file.endsWith('.js')))
            await reloadCommand(client, file, `../../Commands/${subFolder}/${file}`, reloadedArray);
      }
      else if (command == '*') {
        for (const file of readdirSync(`./Commands/${category}`).filter(file => file.endsWith('.js')))
          await reloadCommand(client, file, `../../Commands/${category}/${file}`, reloadedArray);
      }
      else {
        if (!category && !existsSync(path)) errorMsg = `${message.args[0] ? 'This is not a valid category. ' : ''}Valid categories are:\n\`${getDirectoriesSync('./Commands').join('`, `').toLowerCase()}\`, \`*\``;
        else if (!command && !existsSync(path)) errorMsg = `${message.args[1] ? 'This is not a valid command. ' : ''}Valid commands in this category are:\n\`${readdirSync(`./Commands/${category}`).join('`, `').toLowerCase().replace(/\.js/g, '')}\`, \`*\``;
        else await reloadCommand(client, command, path, reloadedArray);
      }
    }
    catch (err) { errorMsg = `An error occurred.\n\`\`\`${err.message}\`\`\`` }

    client.functions.reply(
      errorMsg || (!reloadedArray.length ? 'No commands have been reloaded.' :
        `The following ${reloadedArray.length} command(s) have been reloaded:\n` +
        `\`${reloadedArray.join('`, `')}\``), message
    );
  }
})