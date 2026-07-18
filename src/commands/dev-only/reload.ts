import { codeBlock, inlineCode } from 'discord.js';
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { AllContexts, Command, CommandType, OptionType, getFilename } from '@mephisto5558/command';


const MAX_COMMANDLIST_LENGTH = 800;


export default new Command({
  types: [CommandType.Prefix],
  contexts: AllContexts,
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
      reloadedArray: (string | undefined)[] = [];

    let errorOccurred = false;
    try {
      switch (this.args[0]!.toLowerCase()) {
        case 'file': {
          const filePath = resolve(process.cwd(), this.args[1]!);

          try { await access(filePath); }
          catch (err) {
            if (err.code != 'ENOENT') throw err;
            return void msg.edit(lang('invalidPath'));
          }

          if (this.args[1]?.startsWith('Commands/')) {
            const { command } = commandList.get(getFilename(filePath).toLowerCase()) ?? {};
            reloadedArray.push(command?.mention());
          }

          break;
        }
        case '*': {
          const reloadedCommands = await this.client.commandManager.loadAll();
          reloadedArray.push(...reloadedCommands.map(e => e.command.mention()));
          break;
        }
        default: {
          const command = commandList.get(this.args[0]!.toLowerCase());
          if (!command) return void msg.edit(lang('invalidCommand'));

          await this.client.commandManager.reload(command);
          reloadedArray.push(command.command.mention());
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
        count: inlineCode(reloadedArray.length.toString()),
        commands: commands.length < MAX_COMMANDLIST_LENGTH
          ? commands
          : commands.slice(0, Math.max(0, commands.slice(0, MAX_COMMANDLIST_LENGTH).lastIndexOf('`,') + 1)) + '...'
      });

    void (errorOccurred ? msg.reply(replyText) : msg.edit(replyText));
    log.debug('Finished reloading commands.');
  }
});