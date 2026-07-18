import { CommandOption, OptionType } from '@mephisto5558/command';

import type { CommandType } from '@mephisto5558/command';


const backup = new Map((['creator', 'owner', 'creatorAndOwner', 'admins'] as const).map((e, i) => [e, i]));

export default CommandOption.create<readonly [CommandType.Slash]>()({
  name: 'serverbackup',
  type: OptionType.Subcommand,
  options: [{
    name: 'allowed_to_load',
    type: OptionType.String,
    required: true,
    autocompleteOptions: backup.keys(),
    strictAutocomplete: true
  }],

  async run(lang) {
    await this.guild.updateDB('serverbackup.allowedToLoad', backup.get(this.options.getString('allowed_to_load', true))!);
    return this.editReply(lang('success'));
  }
});