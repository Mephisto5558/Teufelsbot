import { CommandOption, OptionType } from '@mephisto5558/command';

import type { CommandType } from '@mephisto5558/command';


export default CommandOption.create<readonly [CommandType.Slash]>()({
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