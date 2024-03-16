const
  { spawn, exec } = require('node:child_process'),
  asyncExec = require('node:util').promisify(exec),
  getUpdateFunc = /** @param {Message}msg*/ msg => msg.editable && msg.channel.lastMessageId == msg.id ? 'edit' : 'reply';

let restarting = false;

/** @type {command<'prefix', false>}*/
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    if (restarting) return this.reply(lang('alreadyRestarting', restarting));

    restarting = true;
    log(`Restarting bot, initiated by user '${this.user.tag}'...`);

    /** @type {Message}*/
    let msg;
    if (!this.content.toLowerCase().includes('skipnpm')) {
      msg = await this.reply(lang('updatingNPM'));

      try { await asyncExec('npm install'); }
      catch {
        /* eslint-disable-next-line require-atomic-updates */
        restarting = false;
        return msg[getUpdateFunc(msg)](lang('updateNPMError'));
      }
    }

    /* eslint-disable-next-line require-atomic-updates */
    msg = await (msg ?? this)[getUpdateFunc(msg ?? this)](lang('restarting'));

    let child;
    try {
      child = spawn(
        process.execPath, ['--inspect', ...process.argv.slice(1), `uptime=${process.uptime()}`],
        { detached: true, stdio: ['ignore', 'ignore', 'ignore', 'ipc'] }
      );
    }
    catch (err) {
      /* eslint-disable-next-line require-atomic-updates */
      restarting = false;

      log.error('Restarting Error: ', err);
      return msg.content == lang('restartingError') ? undefined : msg[getUpdateFunc(msg)](lang('restartingError'));
    }

    child
      .on('error', () => {
        restarting = false;
        if (msg.content != lang('restartingError')) msg[getUpdateFunc(msg)](lang('restartingError'));
      })
      .on('exit', (code, signal) => {
        restarting = false;

        log.error(`Restarting Error: Exit Code ${code}, signal ${signal}`);
        if (msg.content != lang('restartingError')) msg[getUpdateFunc(msg)](lang('restartingError'));
      })
      .on('message', async message => { // NOSONAR
        if (message != 'Finished starting') return;

        await msg[getUpdateFunc(msg)](lang('success'));

        child.send('Start WebServer');
        child.disconnect();

        process.exit(0);
      });
  }
};