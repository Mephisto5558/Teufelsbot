import { Colors, EmbedBuilder, hyperlink } from 'discord.js';
import { AllContexts, Command, CommandType, CooldownType } from '@mephisto5558/command';
import { timeFormatter: { timeFormatter }, toMs: { secToMs } } from '#utils';

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  cooldowns: { [CooldownType.Channel]: '100ms' },
  contexts: AllContexts,

  async run(lang) {
    const
      { website: { domain, port, uptime }, disableWebserver } = this.client.config,

      embed = new EmbedBuilder({
        description: lang(
          domain && uptime && !disableWebserver ? 'embedDescription' : 'embedDescriptionNoURL', domain && uptime && !disableWebserver && {
            time: timeFormatter(Date.now() - secToMs(process.uptime()), lang).formatted,
            link: hyperlink(lang('online'), domain + (port ? `:${port}` : '') + `/${uptime}`)
          }
        ),
        color: Colors.White
      });

    return this.customReply({ embeds: [embed] });
  }
});