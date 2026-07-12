import type {CommandType} from '@mephisto5558/command';

import { Colors, EmbedBuilder, MessageFlags, TimestampStyles, bold, time } from 'discord.js';
import { CommandOption, OptionType } from '@mephisto5558/command';
import { timeFormatter: { msInSecond } } from '#utils';
import { getTopGuilds } from './_utils';

/** @type {CommandOption<readonly [CommandType.Slash]>} */
export default new CommandOption({
  name: 'user',
  type: OptionType.SubcommandGroup,
  options: [
    {
      name: 'enable',
      type: OptionType.Subcommand,
      options: [{
        name: 'enabled',
        type: OptionType.Boolean,
        required: true
      }]
    },
    { name: 'get', type: OptionType.Subcommand }
  ],

  async run(lang) {
    lang.config.backupPaths.push(`${lang.config.backupPaths.at(-1)}.${this.options.getSubcommand()}`);

    if (this.options.getSubcommand() == 'enable') {
      const enabled = this.options.getBoolean('enabled', true);
      await (this.user.db.wordCounter
        ? this.user.updateDB('wordCounter.enabled', enabled)
        : this.user.updateDB('wordCounter', { enabled, enabledAt: enabled ? undefined : Temporal.Now.instant(), sum: 0, guilds: {} })
      );

      return this.customReply(lang('success', lang(`global.${enabled ? 'enabled' : 'disabled'}`)));
    }

    if (!this.user.db.wordCounter?.enabled) {
      return this.customReply(
        lang('notEnabledUser', this.client.commandManager.get(this.command.name).mention(this.options.getSubcommandGroup(), 'enable'))
      );
    }

    const
      embed = new EmbedBuilder({
        title: lang('embedTitle', this.member.displayName),
        thumbnail: { url: this.user.displayAvatarURL() },
        description: lang('embedDescription', {
          enabledAt: time(Math.floor(this.user.db.wordCounter.enabledAt.epochMilliseconds / msInSecond), TimestampStyles.ShortDateShortTime),
          amount: bold(this.user.db.wordCounter.sum)
        }),
        color: Colors.Blurple
      }),
      guildEmbed = new EmbedBuilder({
        title: lang('guildEmbedTitle'),
        description: lang('guildEmbedDescription', 10),
        color: Colors.Blurple,
        fields: getTopGuilds(this.user, 10)
      });

    await this.customReply({ embeds: [embed] });
    return this.followUp({ embeds: [guildEmbed], flags: MessageFlags.Ephemeral });
  }
});