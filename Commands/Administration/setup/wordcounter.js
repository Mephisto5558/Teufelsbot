const { CommandOption } = require('@mephisto5558/command');

/** @type {CommandOption<['slash']>} */
module.exports = new CommandOption({
  name: 'wordcounter',
  type: 'Subcommand',
  options: [{
    name: 'enabled',
    type: 'Boolean',
    required: true
  }],

  async run(lang) {
    const enabled = this.options.getBoolean('enabled', true);
    await (this.guild.db.wordCounter
      ? this.guild.updateDB('wordCounter.enabled', enabled)
      : this.guild.updateDB('wordCounter', { enabled, enabledAt: enabled ? undefined : new Date(), sum: 0, channels: {}, members: {} })
    );

    return this.customReply(lang('success', lang(`global.${enabled ? 'enabled' : 'disabled'}`)));
  }
});