const { CommandOption, OptionType } = require('@mephisto5558/command');

/** @type {CommandOption<['slash']>} */
module.exports = new CommandOption({
  name: 'autopublish',
  type: OptionType.Subcommand,
  options: [{
    name: 'enabled',
    type: OptionType.Boolean,
    required: true
  }],

  async run(lang) {
    const enabled = this.options.getBoolean('enabled', true);
    await this.guild.updateDB('config.autopublish', enabled);
    return this.customReply(lang('success', lang(`global.${enabled ? 'enabled' : 'disabled'}`)));
  }
});