const
  { Collection } = require('discord.js'),
  { resolve, basename, dirname } = require('path'),
  { access } = require('fs/promises'),
  { formatSlashCommand, slashCommandsEqual } = require('../../Utils');

/**@this {import('discord.js').Client}*/
async function reloadCommand(command, reloadedArray) {
  delete require.cache[command.filePath];

  const
    file = require(command.filePath),
    slashFile = file.slashCommand ? formatSlashCommand(file, `commands.${basename(dirname(command.filePath)).toLowerCase()}.${basename(command.filePath).slice(0, -3)}`) : null;

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

  if (slashFile) {
    const equal = slashCommandsEqual(slashFile, command);
    if (equal) slashFile.id = command.id;
    else {
      if (command.id) await this.application.commands.delete(command.id);
      if (slashFile.disabled || this.botType == 'dev' && !slashFile.beta) {
        slashFile.id = command.id;
        this.log(`Skipped/Deleted Disabled Slash Command ${slashFile.name}`);
      }
      else {
        slashFile.id = (await this.application.commands.create(slashFile)).id;
        this.log(`Reloaded Slash Command ${slashFile.name}`);
      }
    }

    this.slashCommands.delete(command.name);
    this.slashCommands.set(slashFile.name, slashFile);
    reloadedArray.push(`</${slashFile.name}:${slashFile.id  ?? 0}>`);

    for (const alias of new Set([...(slashFile.aliases?.slash || []), ...(command.aliases?.slash || [])])) {
      const { id } = this.slashCommands.get(alias) || {};
      let cmdId;

      if (equal) {
        this.slashCommands.delete(alias);
        this.slashCommands.set(alias, { ...slashFile, id, aliasOf: slashFile.name });
      }
      else {
        this.slashCommands.delete(alias);

        if (slashFile.disabled || this.botType == 'dev' && !slashFile.beta) {
          if (id) await this.application.commands.delete(id);
          this.log(`Skipped/Deleted Disabled Slash Command ${alias} (Alias of ${slashFile.name})`);
        }
        else {
          cmdId = (await this.application.commands.create({ ...slashFile, name: alias.name })).id;
          this.log(`Reloaded Slash Command ${alias} (Alias of ${slashFile.name})`);
        }

        this.slashCommands.set(alias, { ...slashFile, id: cmdId, aliasOf: slashFile.name });
      }

      reloadedArray.push(`</${alias}:${cmdId ?? 0}>`);
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
      commandList = new Collection([...this.client.prefixCommands, ...this.client.slashCommands]);
    let reloadedArray = [];

    try {
      switch (this.args[0].toLowerCase()) {
        case 'file': {
          const filePath = resolve(process.cwd(), this.args[1]);
          try { await access(filePath); }
          catch { return msg.edit(lang('invalidPath')); }

          delete require.cache[filePath];
          reloadedArray.push(basename(filePath));
          break;
        }
        case '*': for (const [, command] of commandList) await reloadCommand.call(this.client, command, reloadedArray); break;
        default: {
          const command = commandList.get(this.args[0]);
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

    const commands = reloadedArray.reduce((acc, e) => acc + (e.startsWith('<') ? e : `\`${e}\``) + ', ', '').slice(0, -2);
    return msg.edit(lang(!reloadedArray.length ? 'noneReloaded' : 'reloaded', { count: reloadedArray.length, commands: commands.length < 800 ? commands : commands.substring(0, commands.substring(0, 800).lastIndexOf('`,') + 1) + '...' }));
  }
};