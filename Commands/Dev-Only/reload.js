/** @import { CommandType } from '@mephisto5558/command' */

const
  { Collection, codeBlock, inlineCode } = require('discord.js'),
  { access } = require('node:fs/promises'),
  { resolve } = require('node:path'),
  { Command, commandTypes, filename, loadFile } = require('@mephisto5558/command'),
  { commandMention } = require('#Utils'),

  MAX_COMMANDLIST_LENGTH = 800;

/**
 * @this {Client}
 * @param {Command<CommandType[], boolean> | string} commandOrPath
 * @param {string[]} reloadedArray gets modified and not returned */
async function reloadCommand(commandOrPath, reloadedArray) {
  /** @type {Command<CommandType[], boolean>} */
  let newCommand;

  if (typeof commandOrPath == 'string') {
    newCommand = await loadFile(commandOrPath);
    if ('default' in newCommand) newCommand = newCommand.default;

    newCommand.init(this.i18n, commandOrPath, log);
    if (newCommand.types.includes(commandTypes.slash))
      newCommand.commandId = (await newCommand.reloadApplicationCommand(this.application, newCommand))?.id;
  }
  else newCommand = await commandOrPath.reload(this.application);

  if (commandOrPath instanceof Command) {
    this.prefixCommands.delete(commandOrPath.name);
    this.slashCommands.delete(commandOrPath.name);
    for (const alias of commandOrPath.aliases.prefix) this.prefixCommands.delete(alias);
    for (const alias of commandOrPath.aliases.slash) this.slashCommands.delete(alias);
  }

  if (newCommand.types.includes(commandTypes.prefix)) {
    this.prefixCommands.set(newCommand.name, newCommand);
    reloadedArray.push(newCommand.name);

    for (const alias of newCommand.aliases.prefix) {
      const commandClone = Object.assign(Object.create(Object.getPrototypeOf(newCommand)), newCommand);
      commandClone.aliasOf = newCommand.name;
      this.prefixCommands.set(alias, commandClone);
      reloadedArray.push(alias);
    }
  }

  if (newCommand.types.includes(commandTypes.slash)) {
    this.slashCommands.set(newCommand.name, newCommand);
    reloadedArray.push(commandMention(newCommand.name, newCommand.commandId));

    const allAppCommands = await this.application.commands.fetch();
    for (const alias of newCommand.aliases.slash) {
      const commandClone = Object.assign(Object.create(Object.getPrototypeOf(newCommand)), newCommand);
      commandClone.aliasOf = newCommand.name;
      commandClone.commandId = allAppCommands.find(cmd => cmd.name == alias)?.id;

      this.slashCommands.set(alias, commandClone);
      reloadedArray.push(commandMention(alias, commandClone.commandId));
    }
  }
}

module.exports = new Command({
  types: [commandTypes.prefix],
  dmPermission: true,
  options: [{
    name: 'command_name',
    type: 'String',
    required: true
  }],
  beta: true,

  async run(lang) {
    log.debug('Reloading files', this.args);

    const
      msg = await this.reply(lang('global.loading', this.client.application.getEmoji('loading'))),
      commandList = new Collection([...this.client.prefixCommands, ...this.client.slashCommands]),

      /** @type {(string | undefined)[]} */
      reloadedArray = [];

    let errorOccurred = false;
    try {
      switch (this.args[0].toLowerCase()) {
        case 'file': {
          const filePath = resolve(process.cwd(), this.args[1]);

          try { await access(filePath); }
          catch (err) {
            if (err.code != 'ENOENT') throw err;
            return void msg.edit(lang('invalidPath'));
          }

          if (this.args[1]?.startsWith('Commands/')) {
            const command = commandList.get(filename(filePath).toLowerCase());
            await reloadCommand.call(this.client, command ?? filePath, reloadedArray);
          }

          break;
        }
        case '*': for (const [, command] of commandList) await reloadCommand.call(this.client, command, reloadedArray); break;
        default: {
          const command = commandList.get(this.args[0].toLowerCase());
          if (!command) return void msg.edit(lang('invalidCommand'));

          await reloadCommand.call(this.client, command, reloadedArray);
        }
      }
    }
    catch (err) {
      errorOccurred = true;

      void msg.edit(lang('error', codeBlock(err.message)));

      if (this.client.botType == 'dev') throw err;
      log.error('Error while trying to reload a command:\n', err);
    }

    const
      commands = reloadedArray.filter(Boolean).map(e => (e.startsWith('<') ? e : inlineCode(e))).join(', '),
      replyText = lang(reloadedArray.length ? 'reloaded' : 'noneReloaded', {
        count: inlineCode(reloadedArray.length),
        commands: commands.length < MAX_COMMANDLIST_LENGTH
          ? commands
          : commands.slice(0, Math.max(0, commands.slice(0, MAX_COMMANDLIST_LENGTH).lastIndexOf('`,') + 1)) + '...'
      });

    void (errorOccurred ? msg.reply(replyText) : msg.edit(replyText));
    log.debug('Finished reloading commands.');
  }
});