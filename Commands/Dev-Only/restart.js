const
  { spawn } = require('node:child_process'),
  { shellExec } = require('#Utils'),
  getUpdateFunc = /** @param {Message} msg */ msg => (msg.editable && msg.channel.lastMessageId == msg.id ? 'edit' : 'reply');

let restarting = false;

/**
 * @param {Message} msg
 * @param {lang} lang
 * @param {Error | number | null} err
 * @param {NodeJS.Signals | undefined} signal */
async function childErrorHandler(msg, lang, err, signal) {
  restarting = false;

  if (err instanceof Error) log.error('Restarting Error: ', err);
  else log.error(`Restarting Error: Exit Code ${err ?? 'none'}, signal ${signal}`);

  if (msg.content != lang('restartingError')) return msg[getUpdateFunc(msg)](lang('restartingError'));
}

/** @type {command<'prefix', false>} */
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  async run(lang) {
    if (restarting) return this.reply(lang('alreadyRestarting', restarting));

    restarting = true;
    log(`Restarting bot, initiated by user '${this.user.tag}'...`);

    /* eslint-disable-next-line @typescript-eslint/no-this-alias -- This assignment is for mutability, not for context preservation. */
    let msg = this;
    if (!this.content.toLowerCase().includes('skipnpm')) {
      log('Installing npm packages...');
      msg = await this.reply(lang('updatingNPM', getEmoji('loading')));

      try { await shellExec('npm install'); }
      catch {
        /* eslint-disable-next-line require-atomic-updates -- false positive: while `restarting` is true, the function cancels early. */
        restarting = false;
        return msg[getUpdateFunc(msg)](lang('updateNPMError'));
      }
    }

    /* eslint-disable-next-line require-atomic-updates -- Not an issue */
    msg = await msg[getUpdateFunc(msg)](lang('restarting', getEmoji('loading')));

    try {
      const child = spawn(
        process.execPath, ['--inspect', ...process.argv.slice(1), `uptime=${process.uptime()}`],
        { detached: true, stdio: ['ignore', 'ignore', 'ignore', 'ipc'] }
      );

      child
        .on('error', childErrorHandler.bind(undefined, msg, lang))
        .on('exit', childErrorHandler.bind(undefined, msg, lang))
        .on('message', async message => {
          if (message != 'Finished starting') return;

          await msg[getUpdateFunc(msg)](lang('success'));

          child.send('Start WebServer');
          child.disconnect();

          process.exit(0); /* eslint-disable-line unicorn/no-process-exit */
        });
    }
    catch (err) {
      restarting = false; /* eslint-disable-line require-atomic-updates -- Not an issue */

      log.error('Restarting Error: ', err);
      return msg.content == lang('restartingError') ? undefined : msg[getUpdateFunc(msg)](lang('restartingError'));
    }
  }
};