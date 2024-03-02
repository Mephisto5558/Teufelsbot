const exec = require('node:util').promisify(require('node:child_process').exec);

/** @type {command<'prefix', false>}*/
module.exports = {
  name: 'exec',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  options: [{ name: 'command', type: 'String', required: true }],
  beta: true,

  run: async function (lang) {
    const msg = await this.reply(lang('global.loading'));

    try {
      const { stdout = lang('global.none'), stderr } = await exec(this.content);
      let response = lang('stdout', { msg: lang('finished', this.content), stdout });
      if (stderr) response += lang('stderr', stderr);

      await msg.customReply(response);
    }
    catch (err) { return msg.customReply(lang('error', { msg: lang('finished', this.content), name: err.name, err: err.message })); }

    return log.debug(`executed bash command '${this.content}'`);
  }
};