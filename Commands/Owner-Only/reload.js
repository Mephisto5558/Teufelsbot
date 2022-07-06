const
  { Command } = require('reconlx'),
  { readdirSync, existsSync, realpathSync } = require('fs'),
  { join } = require('path')

async function reloadCommand(client, commandName, path, reloadedArray) {
  commandName = commandName.replace('.js', '');

  delete require.cache[path];
  const file = require(path);

  if (file.prefixCommand && (client.botType == 'dev' ? file.beta : true)) {
    client.commands.delete(commandName);
    client.commands.set(commandName, file);

    reloadedArray.push(commandName);

    for (const alias of file.aliases) {
      client.commands.delete(alias, file);
      client.commands.set(alias, file);

      reloadedArray.push(alias);
    }
  }

  if (file.slashCommand && (client.botType == 'dev' ? file.beta : true)) {
    client.slashCommands.delete(commandName);
    client.slashCommands.set(commandName, file);

    reloadedArray.push(`/${commandName}`);

    for (const alias of file.aliases) {
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

  run: async (client, message) => {
    const category = message.args[0];
    const command = message.args[1];
    const msg = await message.reply('Reloading...', message);

    let
      errorMsg = 'An error occurred.\n```',
      reloadedArray = [],
      path;

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

      if(category && command) path = realpathSync.native(join(__dirname, `./Commands/${category}/${command}.js`));

      if (!category || !existsSync(path)) errorMsg = `${category ? 'This is not a valid category. ' : ''}Valid categories are:\n\`${readdirSync('./Commands').join('`, `').toLowerCase()}\`, \`*\``;
      else if (!command || !existsSync(path)) errorMsg = `${command ? 'This is not a valid command. ' : ''}Valid commands in this category are:\n\`${readdirSync(`./Commands/${category}`).join('`, `').toLowerCase().replace(/\.js/g, '')}\`, \`*\``;
      else await reloadCommand(client, command, path, reloadedArray);
    }
    catch (err) { errorMsg += err.message + '```' };

    if (errorMsg.length > 22) return msg.edit(errorMsg);
    if (!reloadedArray.length) return msg.edit('No commands have been reloaded.');

    msg.edit(
      `The following ${reloadedArray.length} file(s) have been reloaded:\n` +
      `\`${reloadedArray.join('`, `')}\``
    );
  }
})