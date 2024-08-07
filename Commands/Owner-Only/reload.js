const
  { Collection } = require('discord.js'),
  { resolve, basename, dirname } = require('node:path'),
  { access } = require('node:fs/promises'),
  { formatSlashCommand, slashCommandsEqual } = require('../../Utils');

/**
 * @this {Client}
 * @param {command<'both', boolean>}command
 * @param {string[]}reloadedArray gets modified and not returned*/
async function reloadCommand(command, reloadedArray) {
  delete require.cache[command.filePath];

  /** @type {command<'both', boolean>} */
  let file = {};
  try { file = require(command.filePath); }
  catch (err) {
    if (err.code != 'MODULE_NOT_FOUND') throw err;
  }

  const slashFile = file.slashCommand ? formatSlashCommand(file, `commands.${basename(dirname(command.filePath)).toLowerCase()}.${basename(command.filePath).slice(0, -3)}`, this.i18n) : undefined;

  // NOSONAR
  file.name = command.name;
  file.filePath = command.filePath;
  file.category = command.category;

  this.prefixCommands.delete(command.name);
  if (file.prefixCommand) {
    file.id = command.id;
    this.prefixCommands.set(file.name, file);
    reloadedArray.push(file.name);

    for (const alias of command.aliases?.prefix ?? []) this.prefixCommands.delete(alias);
    for (const alias of file.aliases?.prefix ?? []) {
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
        log(`Skipped/Deleted Disabled Slash Command ${slashFile.name}`);
      }
      else {
        slashFile.id = (await this.application.commands.create(slashFile)).id;
        log(`Reloaded Slash Command ${slashFile.name}`);
      }
    }

    this.slashCommands.delete(command.name);
    this.slashCommands.set(slashFile.name, slashFile);
    reloadedArray.push(`</${slashFile.name}:${slashFile.id ?? 0}>`);

    for (const alias of new Set([...slashFile.aliases?.slash ?? [], ...command.aliases?.slash ?? []])) {
      const { id } = this.slashCommands.get(alias) ?? {};
      let cmdId;

      if (equal) {
        this.slashCommands.delete(alias);
        this.slashCommands.set(alias, { ...slashFile, id, aliasOf: slashFile.name });
      }
      else {
        this.slashCommands.delete(alias);

        if (slashFile.disabled || this.botType == 'dev' && !slashFile.beta) {
          if (id) await this.application.commands.delete(id);
          log(`Skipped/Deleted Disabled Slash Command ${alias} (Alias of ${slashFile.name})`);
        }
        else {
          cmdId = (await this.application.commands.create({ ...slashFile, name: alias.name })).id;
          log(`Reloaded Slash Command ${alias} (Alias of ${slashFile.name})`);
        }

        this.slashCommands.set(alias, { ...slashFile, id: cmdId, aliasOf: slashFile.name });
      }

      reloadedArray.push(`</${alias}:${cmdId ?? 0}>`);
    }
  }
  else if (!file.slashCommand && command.slashCommand) {
    this.slashCommands.delete(command.name);
    if (command.id) await this.application.commands.delete(command.id);
  }
}

/** @type {command<'prefix', false>}*/
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  options: [{ name: 'command_name', type: 'String' }],
  beta: true,

  run: async function (lang) {
    log.debug('Reloading files', this.args);

    const
      msg = await this.reply(lang('global.loading')),
      commandList = new Collection([...this.client.prefixCommands, ...this.client.slashCommands]),
      reloadedArray = [];

    try {
      switch (this.args[0].toLowerCase()) {
        case 'file': {
          const filePath = resolve(process.cwd(), this.args[1]);

          try { await access(filePath); }
          catch (err) {
            if (err.code != 'ENOENT') throw err;
            return msg.edit(lang('invalidPath'));
          }

          if (this.args[1]?.startsWith('Commands/')) {
            /** @type {command<'both', boolean>} */
            const cmd = require(filePath);
            cmd.filePath = filePath;
            cmd.category = this.args[1].split('/')[1].toLowerCase();

            await reloadCommand.call(this.client, cmd, reloadedArray);
          }

          delete require.cache[filePath];
          break;
        }
        case '*': for (const [, command] of commandList) await reloadCommand.call(this.client, command, reloadedArray); break;
        default: {
          const command = commandList.get(this.args[0].toLowerCase());
          if (!command) return msg.edit(lang('invalidCommand'));

          await reloadCommand.call(this.client, command, reloadedArray);
        }
      }
    }
    catch (err) {
      msg.reply(lang('error', err.message));

      if (this.client.botType == 'dev') throw err;
      log.error('Error while trying to reload a command:\n', err);
    }

    const commands = reloadedArray.reduce((acc, e) => acc + (e.startsWith('<') ? e : `\`${e}\``) + ', ', '').slice(0, -2);
    return msg.edit(lang(reloadedArray.length ? 'reloaded' : 'noneReloaded', {
      count: reloadedArray.length,
      commands: commands.length < 800 ? commands : commands.slice(0, Math.max(0, commands.slice(0, 800).lastIndexOf('`,') + 1)) + '...'
    }));
  }
};