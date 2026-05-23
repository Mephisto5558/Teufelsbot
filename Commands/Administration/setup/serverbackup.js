/** @import {CommandType} from '@mephisto5558/command' */

const { CommandOption, OptionType } = require('@mephisto5558/command');

const backup = new Map(['creator', 'owner', 'creatorAndOwner', 'admins'].map((e, i) => [e, i]));

/** @type {CommandOption<readonly [CommandType.Slash]>} */
module.exports = new CommandOption({
  name: 'serverbackup',
  type: OptionType.Subcommand,
  options: [{
    name: 'allowed_to_load',
    type: OptionType.String,
    required: true,
    autocompleteOptions: [...backup.keys()],
    strictAutocomplete: true
  }],

  async run(lang) {
    await this.guild.updateDB('serverbackup.allowedToLoad', backup.get(this.options.getString('allowed_to_load', true)));
    return this.editReply(lang('success'));
  }
});