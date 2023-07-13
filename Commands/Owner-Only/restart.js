const
  { spawn, exec } = require('child_process'),
  asyncExec = require('util').promisify(exec);

let restarting = false;

module.exports = {
  name: 'restart',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    if (restarting) return this.reply(lang('alreadyRestarting', restarting));

    log(`Restarting bot, initiated by user '${this.user.tag}'...`);
    const msg = await this.reply(lang('updatingNPM'));
    restarting = msg.url;

    try { await asyncExec('npm install'); }
    catch {
      restarting = false;
      return msg.edit(lang('updateNPMError'));
    }

    msg.edit(lang('restarting'));

    const child = spawn(process.argv.shift(), [...process.argv, 'isChild=true'], { detached: true });
    child
      .on('error', () => {
        restarting = false;
        if (msg.content != lang('restartingError')) return msg.edit(lang('restartingError'));
      })
      .on('exit', () => {
        restarting = false;
        if (msg.content != lang('restartingError')) return msg.edit(lang('restartingError'));
      })
      .stdout.on('data', async data => {
        if (!data.toString().includes('Ready to serve')) return;

        await msg.edit(lang('success'));
        child.unref();
        process.exit(0);
      });
  }
};