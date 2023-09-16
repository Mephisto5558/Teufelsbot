const
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  sendChallenge = require('./rps_sendChallenge.js'),
  emojis = { r: '✊', p: '🤚', s: '✌️' };

function sendGame(initiator, opponent, lang) {
  const
    embed = new EmbedBuilder({
      title: lang('accept.embedTitle', { player1: initiator.displayName, player2: opponent.displayName }),
      description: lang('accept.embedDescription')
    }).setColor('Random'),
    component = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          customId: `rps.${initiator.id}.r.${opponent.id}`,
          emoji: emojis.r,
          label: lang('r'),
          style: ButtonStyle.Primary
        }),
        new ButtonBuilder({
          customId: `rps.${initiator.id}.p.${opponent.id}`,
          emoji: emojis.p,
          label: lang('p'),
          style: ButtonStyle.Primary
        }),
        new ButtonBuilder({
          customId: `rps.${initiator.id}.s.${opponent.id}`,
          emoji: emojis.s,
          label: lang('s'),
          style: ButtonStyle.Primary
        })
      ]
    });

  return this.message.edit({ embeds: [embed], components: [component] });
}

/** this.customId: `rps.<initiatorId>.<mode>.<opponentId>`
 * @this {import('discord.js').ButtonInteraction} @param {string}initiatorId @param {string}opponentId*/
module.exports = async function rps(lang, initiatorId, mode, opponentId) {
  if (this.user.id != initiatorId && this.user.id != opponentId) return;
  if (mode.length != 1) await this.deferUpdate();

  lang.__boundArgs__[0].backupPath = 'commands.minigames.rps';

  const
    initiator = await this.guild.members.fetch(initiatorId).catch(() => { }),
    opponent = await this.guild.members.fetch(opponentId).catch(() => { });

  if (!initiator || !opponent) {
    this.message.embeds[0].data.description = lang('memberNotFound');
    return this.message.edit({ embeds: this.message.embeds, components: [] });
  }

  switch (mode) {
    case 'cancel':
    case 'decline': {
      this.message.embeds[0].data.description = lang('declined', this.member.displayName);
      return this.message.edit({ embeds: this.message.embeds, components: [] });
    }
    case 'accept': if (opponent.user.bot || this.user.id == opponentId) return sendGame.call(this, initiator, opponent, lang); break;
    case 'playAgain': {
      if (opponent.user.bot) return sendGame.call(this, initiator, opponent, lang);
      return sendChallenge.call(this, this.member, initiatorId == this.user.id ? opponent : initiator, lang);
    }
    case 'r':
    case 'p':
    case 's': {
      const choices = this.client.db.get('guildSettings', `${this.guild.id}.minigames.rps.${this.message.id}`) || {};
      if (opponentId == this.client.user.id) choices.player2 = ['r', 'p', 's'].random();

      if (choices.player1 && this.user.id == initiatorId || choices.player2 && this.user.id == opponentId) return this.reply({ content: lang('end.alreadyChosen', choices.player1 || choices.player2), ephemeral: true });

      if (this.user.id == initiatorId) {
        choices.player1 = mode;
        if (!choices.player2) await this.client.db.update('guildSettings', `${this.guild.id}.minigames.rps.${this.message.id}.player1`, mode);
      }
      else {
        choices.player2 = mode;
        if (!choices.player1) await this.client.db.update('guildSettings', `${this.guild.id}.minigames.rps.${this.message.id}.player2`, mode);
      }

      if (!choices.player1 || !choices.player2) return this.reply({ content: lang('end.saved', lang(mode)), ephemeral: true });
      else await this.client.db.delete('guildSettings', `${this.guild.id}.minigames.rps.${this.message.id}`);

      if (choices.player1 == choices.player2) this.message.embeds[0].data.description = lang('end.tie', emojis[mode]);
      else {
        const winner = choices.player1 == 'r' && choices.player2 == 's' || choices.player1 == 'p' && choices.player2 == 'r' || choices.player1 == 's' && choices.player2 == 'p' ? initiatorId : opponentId;
        this.message.embeds[0].data.description = lang('end.win', { winner, winEmoji: emojis[initiatorId == winner ? choices.player1 : choices.player2], loseEmoji: emojis[initiatorId == winner ? choices.player2 : choices.player1] });
      }

      const component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          customId: `rps.${initiatorId}.playAgain.${opponentId}`,
          label: lang('global.playAgain'),
          style: ButtonStyle.Success
        })]
      });

      return this.update({ embeds: this.message.embeds, components: [component] });
    }
  }
};
