import { Colors, EmbedBuilder, hyperlink } from 'discord.js';
import { AllContexts, Command, CommandType } from '@mephisto5558/command';

import { website = {}, disableWebserver } from '#utils'.getConfig();

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  contexts: AllContexts,
  disabled: !!disableWebserver || !website.domain || !website.invite,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing invite or domain url path in config.json',

  async run(lang) {
    const { domain, port, invite } = this.client.config.website;
    if (!domain) return this.customReply(lang('events.command.missingDomainConfig'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', hyperlink(lang('global.here'), domain + (port ? `:${port}` : '') + `/${invite}`)),
      color: Colors.Blue
    });

    return this.customReply({ embeds: [embed] });
  }
});