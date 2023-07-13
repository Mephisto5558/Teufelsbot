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
      msg.edit(lang('updateNPMError'));
      return (restarting = false);
    }

    msg.edit(lang('restarting'));

    const child = spawn(process.argv.shift(), [...process.argv, 'isChild=true'], { detached: true });
    child
      .on('error', () => {
        if (msg.content != lang('restartingError')) msg.edit(lang('restartingError'));
        restarting = false;
      })
      .on('exit', () => {
        if (msg.content != lang('restartingError')) msg.edit(lang('restartingError'));
        restarting = false;
      })
      .stdout.on('data', async data => {
        if (!data.toString().includes('Ready to serve')) return;

        await msg.edit(lang('success'));
        child.unref();
        process.exit(0);
      });
  }
};