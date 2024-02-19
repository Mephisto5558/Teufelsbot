const exec = require('node:util').promisify(require('node:child_process').exec);

/** @type {command<'prefix', false>}*/
module.exports = {
  name: 'exec',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    if (!this.content) return;

    try {
      const { stdout = lang('global.none'), stderr } = await exec(this.content);
      let msg = lang('stdout', { msg: lang('finished', this.content), stdout });
      if (stderr) msg += lang('stderr', stderr);

      await this.customReply(msg);
    }
    catch (err) { return this.customReply(lang('error', { msg: lang('finished', this.content), name: err.name, err: err.message })); }

    return log.debug(`executed bash command '${this.content}'`);
  }
};