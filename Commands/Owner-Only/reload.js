const { Collection } = require('discord.js');

async function reloadCommand({ name, category, filePath }, reloadedArray) {
  delete require.cache[filePath];
  const file = require(filePath);

  if ((this.botType == 'dev' && !file.beta) || file.disabled) return;
  file.filePath = filePath;
  file.category = category;

  if (file.prefixCommand) {
    this.prefixCommands.set(name, file);
    reloadedArray.push(name);

    for (const alias of file.aliases?.prefix || []) {
      this.prefixCommands.set(alias, { ...file, aliasOf: file.name });
      reloadedArray.push(alias);
    }
  }

  if (file.slashCommand) {
    this.slashCommands.set(name, file);
    reloadedArray.push(`/${name}`);

    for (const alias of file.aliases?.slash || []) {
      this.slashCommands.set(alias, { ...file, aliasOf: file.name });
      reloadedArray.push(`/${alias}`);
    }
  }
}

module.exports = {
  name: 'reload',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    if (!this.args[0]) return this.reply(lang('invalidCommand'));

    const commandArray = new Collection([...this.client.prefixCommands, ...this.client.slashCommands]);
    let reloadedArray = [];

    try {
      if (this.args[0] == '*') {
        for (const [, command] of commandArray)
          await reloadCommand.call(this.client, command, reloadedArray);
      }
      else {
        const command = commandArray.get(this.args[0]);
        if (!command) return this.reply(lang('invalidCommand'));

        await reloadCommand.call(this.client, command, reloadedArray);
      }
    }
    catch (err) {
      this.customReply(lang('error', err.message));
      this.client.error('Error while trying to reload a command:\n', err);
    }

    const commands = reloadedArray.join('`, `');
    return this.customReply(lang(!reloadedArray.length ? 'noneReloaded' : 'reloaded', { count: reloadedArray.length, commands: commands.length < 800 ? commands : commands.substring(0, commands.substring(0, 800).lastIndexOf('`,') + 1) + '...' }));
  }
};