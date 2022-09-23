const
  { readdirSync, existsSync } = require('fs'),
  { join } = require('path');

async function reloadCommand(commandName, path, reloadedArray) {
  delete require.cache[require.resolve(path)];
  const file = require(path);

  if (this.botType == 'dev' ? !file.beta : file.disabled) return;

  if (file.prefixCommand) {
    this.prefixCommands.set(commandName, file);
    reloadedArray.push(commandName);

    for (const alias of file.aliases.prefix) {
      this.prefixCommands.set(alias, file);
      reloadedArray.push(alias);
    }
  }

  if (file.slashCommand) {
    this.slashCommands.set(commandName, file);
    reloadedArray.push(`/${commandName}`);

    for (const alias of file.aliases.slash) {
      this.slashCommands.set(alias, file);
      reloadedArray.push(`/${alias}`);
    }
  }
}

module.exports = {
  name: 'reload',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: async function (lang, client) {
    let category, command, errorMsg, reloadedArray = [];

    if (this.args[0] == '*') category = '*';
    else if (this.args[0]) category = getDirectoriesSync('./Commands').filter(e => e.toLowerCase() == this.args[0].toLowerCase())?.[0];

    if (category && category != '*') {
      if (this.args[1] == '*') command = '*';
      else if (this.args[1]) command = readdirSync(`./Commands/${category}`).filter(e => e.endsWith('.js') && e.toLowerCase() == `${this.args[1].toLowerCase()}.js`)?.[0];
    }

    const path = join(__dirname, `../../Commands/${category}/${command}`);

    try {
      if (category == '*') {
        for (const subFolder of getDirectoriesSync('./Commands'))
          for (const file of readdirSync(`./Commands/${subFolder}`).filter(e => e.endsWith('.js')))
            await reloadCommand.call(client, file.slice(0, -3), `../../Commands/${subFolder}/${file}`, reloadedArray);
      }
      else if (command == '*') {
        for (const file of readdirSync(`./Commands/${category}`).filter(e => e.endsWith('.js')))
          await reloadCommand.call(client, file.slice(0, -3), `../../Commands/${category}/${file}`, reloadedArray);
      }
      else {
        if (!category && !existsSync(path)) errorMsg = (this.args[0] ? lang('invalidCategory') : '') + lang('validCategoryList', getDirectoriesSync('./Commands').join('`, `').toLowerCase());
        else if (!command && !existsSync(path)) errorMsg = (this.args[1] ? lang('invalidCommand') : '') + lang('validCommandList', readdirSync(`./Commands/${category}`).join('`, `').toLowerCase().replaceAll('.js', ''));
        else await reloadCommand.call(client, command.slice(0, -3), path, reloadedArray);
      }
    }
    catch (err) { errorMsg = lang('error', err.message) }

    this.customReply(errorMsg || (!reloadedArray.length ? lang('noneReloaded') : lang('reloaded', { count: reloadedArray.length, commands: reloadedArray.join('`, `') })));
  }
}