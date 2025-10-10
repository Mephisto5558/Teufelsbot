/** @import subcommand from '.' */

/** @type {subcommand} */
module.exports = {
  options: [{
    name: 'enabled',
    type: 'Boolean',
    required: true
  }],

  async run(lang) {
    const enabled = this.options.getBoolean('enabled', true);
    await this.guild.updateDB('config.autopublish', enabled);
    return this.customReply(lang('success', lang(`global.${enabled ? 'enabled' : 'disabled'}`)));
  }
};