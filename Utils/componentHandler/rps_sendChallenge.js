/** @import { rps_sendChallenge } from '.' */

const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, bold, userMention } = require('discord.js'),
  BLUE = 0x2980B9;

/** @type {rps_sendChallenge} */
module.exports = async function sendRPSChallenge(lang, initiator, opponent) {
  opponent ??= this.client.user;

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
};