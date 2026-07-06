import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, bold, userMention } from 'discord.js';
import type { GuildMember } from 'discord.js';
import type { GuildButtonInteraction, Response } from './index.ts';

const BLUE = 0x2980B9;

export default async function sendRPSChallenge(
  this: GuildInteraction | Message<true> | GuildButtonInteraction, lang: lang,
  initiator: GuildMember, opponent_?: GuildMember
): Promise<Response> {
  const opponent = opponent_ ?? this.guild.members.me!;

  lang.config.backupPaths[0] = 'commands.minigames.rps.challenge';

  if (opponent.user.bot && opponent.id != this.client.user.id) return this.customReply(lang('opponentIsBot'));
  if (opponent.id == initiator.id) return this.customReply(lang('opponentIsSelf'));

  const
    embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang(`${opponent.user.bot ? 'botE' : 'e'}mbedDescription`, bold(initiator.displayName)),
      color: BLUE
    }),
    component = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          customId: `rps.${initiator.id}.accept.${opponent.id}`,
          label: lang(opponent.user.bot ? 'start' : 'accept'),
          style: ButtonStyle.Success
        }),
        new ButtonBuilder({
          customId: `rps.${initiator.id}.decline.${opponent.id}`,
          label: lang(opponent.user.bot ? 'global.cancel' : 'decline'),
          style: ButtonStyle.Danger
        })
      ]
    }),

    msg = await this.customReply({ content: opponent.user.bot ? undefined : userMention(opponent.id), embeds: [embed], components: [component] }),
    deleteTime = 5000;

  if (!opponent.user.bot) return msg.reply(lang('newChallenge', userMention(opponent.id))).then(e => setTimeout(() => void e.delete(), deleteTime));
}