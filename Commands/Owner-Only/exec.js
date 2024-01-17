const exec = require('util').promisify(require('child_process').exec);

/**@type {command}*/
module.exports = {
  name: 'exec',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  /**@this Message*/
  run: async function (lang) {
    if (!this.content) return;
    
    const { stdout = lang('global.none'), stderr } = await exec(this.content);

    let msg = lang('finished', { code: this.content, stdout });
    if (stderr) msg += lang('error', stderr);

    return this.customReply(msg);
  }
};
