const
  { spawn, exec } = require('child_process'),
  asyncExec = require('util').promisify(exec),
  getUpdateFunc = /**@param {Message}msg*/ msg => msg.editable && msg.channel.lastMessageId == msg.id ? 'edit' : 'reply';

let restarting = false;

/**@type {command}*/
module.exports = {
  name: 'restart',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  /**@this Message*/
  run: async function (lang) {
    if (restarting) return this.reply(lang('alreadyRestarting', restarting));

    restarting = true;
    log(`Restarting bot, initiated by user '${this.user.tag}'...`);

    let msg;
    if (!this.content.toLowerCase().includes('skipnpm')) {
      msg = await this.reply(lang('updatingNPM'));

      try { await asyncExec('npm install'); }
      catch {
        restarting = false;
        return msg[getUpdateFunc(msg)](lang('updateNPMError'));
      }
    }

    /**@type {Message}*/
    msg = await (msg ?? this)[getUpdateFunc(msg ?? this)](lang('restarting'));

    /**@type {import('child_process').ChildProcess}*/
    let child;
    try { child = spawn(process.execPath, ['--inspect', ...(process.argv.slice(1) || ['.']), `uptime=${process.uptime()}`], { detached: true, stdio: ['inherit', 'inherit', 'inherit', 'ipc'], }); }
    catch (err) {
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
      .on('message', async message => {
        if (message != 'Finished starting') return;

        await msg[getUpdateFunc(msg)](lang('success'));

        child.send('Start WebServer');
        child.disconnect();

        process.exit(0);
      });
  }
};