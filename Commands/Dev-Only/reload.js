const
  { codeBlock, inlineCode } = require('discord.js'),
  { access } = require('node:fs/promises'),
  { resolve } = require('node:path'),
  { Command, CommandType, OptionType, filename } = require('@mephisto5558/command'),

  MAX_COMMANDLIST_LENGTH = 800;


module.exports = new Command({
  types: [CommandType.Prefix],
  dmPermission: true,
  options: [{
    name: 'command_name',
    type: OptionType.String,
    required: true
  }],
  beta: true,

  async run(lang) {
    log.debug('Reloading files', this.args);

    const
      msg = await this.reply(lang('global.loading', this.client.application.getEmoji('loading'))),
      commandList = this.client.commandManager.commands,

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
            reloadedArray.push(command.mention);
          }

          break;
        }
        case '*': {
          const reloadedCommands = await this.client.commandManager.reloadAll();
          reloadedArray.push(...reloadedCommands.map(e => e.mention));
          break;
        }
        default: {
          const command = commandList.get(this.args[0].toLowerCase());
          if (!command) return void msg.edit(lang('invalidCommand'));

          await this.client.commandManager.reload(command);
          reloadedArray.push(command.mention);
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