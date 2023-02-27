const
  { Collection } = require('discord.js'),
  { resolve, basename, dirname } = require('path'),
  { existsSync } = require('fs'),
  { formatSlashCommand, slashCommandsEqual } = require('../../Utils');

/**@this {import('discord.js').Client}*/
async function reloadCommand(command, reloadedArray) {
  delete require.cache[command.filePath];
  const file = formatSlashCommand(require(command.filePath), `commands.${basename(dirname(command.filePath)).toLowerCase()}.${basename(command.filePath).slice(0, -3)}`);

  file.filePath = command.filePath;
  file.category = command.category;

  if (file.prefixCommand) {
    file.id = command.id;
    this.prefixCommands.delete(command.name);
    this.prefixCommands.set(file.name, file);
    reloadedArray.push(file.name);

    for (const alias of command.aliases?.prefix || []) this.prefixCommands.delete(alias);
    for (const alias of file.aliases?.prefix || []) {
      this.prefixCommands.set(alias, { ...file, aliasOf: file.name });
      reloadedArray.push(alias);
    }
  }

  if (file.slashCommand) {
    const equal = slashCommandsEqual(file, command);
    if (equal) file.id = command.id;
    else {
      await this.application.commands.delete(command.id);
      file.id = (await this.application.commands.create(file)).id;
      this.log(`Reloaded Slash Command ${command.name}`);
    }

    this.slashCommands.delete(command.name);
    this.slashCommands.set(file.name, file);
    reloadedArray.push(`/${file.name}`);

    for (const alias of new Set([...(file.aliases?.slash || []), ...(command.aliases?.slash || [])])) {
      if (equal) {
        this.slashCommands.delete(alias);
        this.slashCommands.set(alias, { ...file, id: command.id, aliasOf: file.name });
      }
      else {
        if (this.slashCommands.has(alias)) {
          const { id } = this.slashCommands.get(alias);
          try { await this.application.commands.delete(id); } catch { }
          this.slashCommands.delete(alias);
        }

        const { id } = await this.application.commands.create(file);
        this.slashCommands.set(alias, { ...file, id, aliasOf: file.name });
        this.log(`Reloaded Slash Command ${alias} (Alias of ${command.name})`);
      }

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

    const
      msg = await this.reply(lang('global.loading')),
      commandArray = new Collection([...this.client.prefixCommands, ...this.client.slashCommands]);
    let reloadedArray = [];

    try {
      switch (this.args[0].toLowerCase()) {
        case 'file': {
          const filePath = resolve(process.cwd(), this.args[1]);
          if (!existsSync(filePath)) return msg.edit(lang('invalidPath'));

          delete require.cache[filePath];
          reloadedArray.push(basename(filePath));
          break;
        }
        case '*': for (const [, command] of commandArray) await reloadCommand.call(this.client, command, reloadedArray); break;
        default: {
          const command = commandArray.get(this.args[0]);
          if (!command) return msg.edit(lang('invalidCommand'));

          await reloadCommand.call(this.client, command, reloadedArray);
        }
      }
    }
    catch (err) {
      msg.edit(lang('error', err.message));

      if (this.client.botType == 'dev') throw err;
      else this.client.error('Error while trying to reload a command:\n', err);
    }

    const commands = reloadedArray.join('`, `');
    return msg.edit(lang(!reloadedArray.length ? 'noneReloaded' : 'reloaded', { count: reloadedArray.length, commands: commands.length < 800 ? commands : commands.substring(0, commands.substring(0, 800).lastIndexOf('`,') + 1) + '...' }));
  }
};