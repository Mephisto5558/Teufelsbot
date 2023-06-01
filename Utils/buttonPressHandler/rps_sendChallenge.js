const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**@this {import('discord.js').ChatInputCommandInteraction|import('discord.js').Message|import('discord.js').ButtonInteraction}@param {import('discord.js').GuildMember}initiator @param {import('discord.js').GuildMember}opponent*/
module.exports = async function sendRPSChallenge(initiator, opponent = this.client.user, lang = null) {
  lang.__boundArgs__[0].backupPath = 'commands.minigames.rps.challenge';

  if (opponent.bot && opponent.id != this.client.user.id) return this.replied ? this.editReply(lang('opponentIsBot')) : this.reply(lang('opponentIsBot'));
  if (opponent.id == initiator.id) return this.replied ? this.editReply(lang('opponentIsSelf')) : this.reply(lang('opponentIsSelf'));

  const data = {
    content: opponent.bot ? undefined : `<@${opponent.id}>`,
    embeds: [new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang(`${opponent.bot ? 'botE' : 'e'}mbedDescription`, initiator.displayName),
      color: 2719929
    })],
    components: [new ActionRowBuilder({
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
        }),
      ]
    })]
  };

  let msg;
  if (this.message?.editable || this.editable) msg = await (this.message ?? this).edit(data);
  else msg = await (this.replied ? this.editReply(data) : this.reply(data));

  if (!opponent.bot) return msg.reply(lang('newChallenge', opponent.id)).then(e => setTimeout(e.delete.bind(e), 5000));
};