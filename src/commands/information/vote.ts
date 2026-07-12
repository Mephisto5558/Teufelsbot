import { Colors, EmbedBuilder, hyperlink } from 'discord.js';
import { AllContexts, Command, CommandType } from '@mephisto5558/command';

import { website = {}, disableWebserver } from '#utils'.getConfig();

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  contexts: AllContexts,
  disabled: !!disableWebserver || !website.domain || !website.vote,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing domain or vote url path in config.json',

  async run(lang) {
    const
      { domain, port, vote } = this.client.config.website,

      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang('embedDescriptionVote', hyperlink(lang('global.here'), `${domain}/` + (port ? `:${port}` : '') + `/${vote}`)),
        color: Colors.Blurple
      });

    return this.customReply({ embeds: [embed] });
  }
});