const
  { spawn, exec } = require('child_process'),
  asyncExec = require('util').promisify(exec);

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

    log(`Restarting bot, initiated by user '${this.user.tag}'...`);

    let msg;
    if (!this.args.some(e => e.toLowerCase() == 'skipnpm')) {
      msg = await this.reply(lang('updatingNPM'));
      restarting = msg.url;

      try { await asyncExec('npm install'); }
      catch {
        restarting = false;
        return msg.edit(lang('updateNPMError'));
      }
    }

    msg = await (msg?.edit(lang('restarting')) ?? this.reply(lang('restarting')));
    restarting ??= msg.url;

    let child;
    try { child = spawn(process.argv[0], [...(process.argv.slice(1) || '.'), 'isChild=true'], { detached: true }); }
    catch (err) {
      restarting = false;

      log.error('Restarting Error: ', err);
      return msg.content != lang('restartingError') ? msg.edit(lang('restartingError')) : undefined;
    }

    child
      .on('error', () => {
        restarting = false;
        if (msg.content != lang('restartingError')) msg.edit(lang('restartingError'));
      })
      .on('exit', (code, signal) => {
        restarting = false;

        log.error(`Restarting Error: Exit Code ${code}, signal ${signal}`);
        if (msg.content != lang('restartingError')) msg.edit(lang('restartingError'));
      })
      .stdout.on('data', async data => {
        if (!data.toString().includes('Ready to serve')) return;

        await msg.edit(lang('success'));
        child.unref();
        process.exit(0);
      });
  }
};