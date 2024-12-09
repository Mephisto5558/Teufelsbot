const
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  BLUE = 0x2980B9;

/** @type {import('.').rps_sendChallenge} */
module.exports = async function sendRPSChallenge({ initiator, opponent, lang }) {
  opponent ??= this.client.user;

  lang.__boundArgs__[0].backupPath = 'commands.minigames.rps.challenge';

  if (opponent.bot && opponent.id != this.client.user.id) return this.replied ? this.editReply(lang('opponentIsBot')) : this.reply(lang('opponentIsBot'));
  if (opponent.id == initiator.id) return this.replied ? this.editReply(lang('opponentIsSelf')) : this.reply(lang('opponentIsSelf'));

  const
    embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang(`${opponent.bot ? 'botE' : 'e'}mbedDescription`, initiator.displayName),
      color: BLUE
    }),
    component = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          customId: `rps.${initiator.id}.accept.${opponent.id}`,
          label: lang(opponent.bot ? 'start' : 'accept'),
          style: ButtonStyle.Success
        }),
        new ButtonBuilder({
          customId: `rps.${initiator.id}.decline.${opponent.id}`,
          label: lang(opponent.bot ? 'global.cancel' : 'decline'),
          style: ButtonStyle.Danger
        })
      ]
    });

  const
    msg = await this.customReply({ content: opponent.bot ? undefined : `<@${opponent.id}>`, embeds: [embed], components: [component] }),
    deleteTime = 5000;

  if (!opponent.bot) return msg.reply(lang('newChallenge', opponent.id)).then(e => setTimeout(e.delete.bind(e), deleteTime));
};