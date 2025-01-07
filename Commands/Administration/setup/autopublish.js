module.exports = {
  /** @type {NonNullable<command<'slash'>['options']>[number]['options']} */
  options: [{
    name: 'enabled',
    type: 'Boolean',
    required: true
  }],

  /** @type {command<'slash'>['run']} */
  async run(lang) {
    const enabled = this.options.getBoolean('enabled');
    await this.guild.updateDB('config.autopublish', enabled);
    return this.customReply(lang('success', lang(`global.${enabled ? 'enabled' : 'disabled'}`)));
  }
};