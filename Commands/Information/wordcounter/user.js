/** @type {import('.').default} */
module.exports = {
  options: [
    {
      name: 'enable',
      type: 'Subcommand',
      options: [{
        name: 'enabled',
        type: 'Boolean',
        required: true
      }]
    },
    { name: 'get', type: 'Subcommand' }
  ],

  async run(lang) {
    lang.__boundArgs__[0].backupPath += `.${this.options.getSubcommand(true)}`;

    if (this.options.getSubcommand(true) == 'enable') {
      const enabled = this.options.getBoolean('enabled', true);
      await (this.user.db.wordCounter
        ? this.user.updateDB('wordCounter.enabled', enabled)
        : this.user.updateDB('wordCounter', { enabled, enabledAt: enabled ? undefined : new Date(), sum: 0, guilds: {} })
      );

      return this.customReply(lang('success', lang(`global.${enabled ? 'enabled' : 'disabled'}`)));
    }
  }
};