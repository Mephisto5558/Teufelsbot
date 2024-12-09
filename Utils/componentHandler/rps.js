const
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  DiscordAPIErrorCodes = require('../DiscordAPIErrorCodes.json'),
  sendChallenge = require('./rps_sendChallenge.js'),
  emojis = { rock: '✊', paper: '🤚', scissors: '✌️' },
  winningAgainst = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

/**
 * @this {GuildInteraction | import('discord.js').ButtonInteraction<'cached'>}
 * @param {import('discord.js').GuildMember}initiator
 * @param {import('discord.js').GuildMember}opponent
 * @param {lang}lang */
function sendGame(initiator, opponent, lang) {
  const
    embed = new EmbedBuilder({
      title: lang('accept.embedTitle', { player1: initiator.displayName, player2: opponent.displayName }),
      description: lang('accept.embedDescription')
    }).setColor('Random'),
    component = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          customId: `rps.${initiator.id}.rock.${opponent.id}`,
          emoji: emojis.rock,
          label: lang('rock'),
          style: ButtonStyle.Primary
        }),
        new ButtonBuilder({
          customId: `rps.${initiator.id}.paper.${opponent.id}`,
          emoji: emojis.paper,
          label: lang('paper'),
          style: ButtonStyle.Primary
        }),
        new ButtonBuilder({
          customId: `rps.${initiator.id}.scissors.${opponent.id}`,
          emoji: emojis.scissors,
          label: lang('scissors'),
          style: ButtonStyle.Primary
        })
      ]
    });

  return this.message.edit({ embeds: [embed], components: [component] });
}

/** @type {import('.').rps} */
module.exports = async function rps(lang, initiatorId, mode, opponentId) {
  if (this.user.id != initiatorId && this.user.id != opponentId) return;
  if (mode.length != 1) await this.deferUpdate();

  lang.__boundArgs__[0].backupPath = 'commands.minigames.rps';

  let initiator, opponent;
  try {
    initiator = await this.guild.members.fetch(initiatorId);
    opponent = await this.guild.members.fetch(opponentId);
  }
  catch (err) {
    if (err.code != DiscordAPIErrorCodes.UnknownMember) throw err;

    this.message.embeds[0].data.description = lang('memberNotFound');
    return this.message.edit({ embeds: this.message.embeds, components: [] });
  }

  switch (mode) {
    case 'cancel':
    case 'decline':
      this.message.embeds[0].data.description = lang(this.user.id == initiator.id ? 'canceled' : 'declined', this.member.displayName);
      return this.message.edit({ embeds: this.message.embeds, components: [] });

    case 'accept': if (opponent.user.bot || this.user.id == opponentId) return sendGame.call(this, initiator, opponent, lang); break;
    case 'playAgain':
      if (this.client.botType != 'dev') await this.client.db.update('botSettings', 'cmdStats.rps.slash', (this.client.settings.cmdStats.rps.slash ?? 0) + 1);

      if (opponent.user.bot) return sendGame.call(this, initiator, opponent, lang);
      return sendChallenge.call(this, { initiator: this.member, opponent: initiatorId == this.user.id ? opponent : initiator, lang });

    case 'rock':
    case 'paper':
    case 'scissors': {
      const choices = opponentId == this.client.user.id ? { player1: mode, player2: ['rock', 'paper', 'scissors'].random() } : this.guild.db.minigames?.rps[this.message.id] ?? {};
      if (!choices.player1 || !choices.player2) {
        const player = this.user.id == initiatorId ? 'player1' : 'player2';
        if (choices[player]) return this.reply({ content: lang('end.alreadyChosen', lang(choices[player])), ephemeral: true });

        choices.startedAt ??= Date.now();
        choices[player] = mode;

        await this.guild.updateDB(`minigames.rps.${this.message.id}`, choices);
        void this.reply({ content: lang('end.saved', lang(mode)), ephemeral: true });

        if (!choices.player1 || !choices.player2) return;
      }

      await this.client.db.delete('guildSettings', `${this.guild.id}.minigames.rps.${this.message.id}`);
      if (choices.player1 == choices.player2) this.message.embeds[0].data.description = lang('end.tie', emojis[mode]);
      else {
        const winner = winningAgainst[choices.player1] == choices.player2 ? initiatorId : opponentId;

        this.message.embeds[0].data.description = lang('end.win', {
          winner, winEmoji: emojis[initiatorId == winner ? choices.player1 : choices.player2],
          loseEmoji: emojis[initiatorId == winner ? choices.player2 : choices.player1]
        });
      }

      const component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          customId: `rps.${initiatorId}.playAgain.${opponentId}`,
          label: lang('global.playAgain'),
          style: ButtonStyle.Success
        })]
      });

      return this.message.edit({ embeds: this.message.embeds, components: [component] });
    }

    default: throw new Error('Unsupported mode');
  }
};