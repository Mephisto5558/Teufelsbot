import type {CommandType} from '@mephisto5558/command';

import { hyperlink } from 'discord.js';
import { CommandOption, OptionType } from '@mephisto5558/command';

import { website = {}, disableWebserver } from '#utils'.getConfig();


/** @type {CommandOption<readonly [CommandType.Slash]>} */
export default new CommandOption({
  name: 'birthday',
  type: OptionType.Subcommand,
  disabled: !!disableWebserver || !website.domain,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing domain url in config.json',

  async run(lang) {
    const { domain, port } = this.client.config.website;

    if (!domain) return this.customReply(lang('events.command.missingDomainConfig'));
    return this.customReply(lang('useDashboard', hyperlink(lang('link'), domain + (port ? `:${port}` : '') + `/guild/${this.guild.id}#birthday`)));
  }
});