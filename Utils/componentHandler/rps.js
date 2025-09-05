const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, inlineCode, userMention } = require('discord.js'),
  sendChallenge = require('./rps_sendChallenge'),
  DiscordAPIErrorCodes = require('../DiscordAPIErrorCodes.json'),

  emojis = { rock: '✊', paper: '🤚', scissors: '✌️' },
  winningAgainst = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

/**
 * @this {GuildInteraction | import('discord.js').ButtonInteraction<'cached'>}
 * @param {import('discord.js').GuildMember} initiator
 * @param {import('discord.js').GuildMember} opponent
 * @param {lang} lang
 * @returns {Message} */
function sendGame(initiator, opponent, lang) {
  const
    embed = new EmbedBuilder({
      title: lang('accept.embedTitle', { player1: inlineCode(initiator.displayName), player2: inlineCode(opponent.displayName) }),
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

/**
 * @this {import('discord.js').ButtonInteraction<'cached'>}
 * @param {import('discord.js').GuildMember} initiator
 * @param {import('discord.js').GuildMember} opponent
 * @param {import('.').PlayOptions} mode
 * @param {lang} lang */
async function runGame(initiator, opponent, mode, lang) {
  const choices = opponent.id == this.client.user.id
    ? { player1: mode, player2: ['rock', 'paper', 'scissors'].random() }
    : this.guild.db.minigames?.rps[this.message.id] ?? {};

  if (!choices.player1 || !choices.player2) {
    const player = this.user.id == initiator.id ? 'player1' : 'player2';
    if (choices[player]) return this.followUp({ content: lang('end.alreadyChosen', lang(choices[player])), flags: MessageFlags.Ephemeral });

    choices.startedAt ??= Date.now();
    choices[player] = mode;

    if (!choices.player1 || !choices.player2) {
      /* eslint-disable-next-line @typescript-eslint/restrict-plus-operands -- description will exist */
      this.message.embeds[0].data.description += '\n' + lang('end.chosen', userMention(this.user.id));
      void this.message.edit({ embeds: this.message.embeds });
      return void await this.guild.updateDB(`minigames.rps.${this.message.id}`, choices);
    }
  }

  return endGame.call(this, choices, initiator, opponent, lang);
}

/**
 * @this {import('discord.js').ButtonInteraction<'cached'>}
 * @param {{ player1: import('.').PlayOptions, player2: import('.').PlayOptions }} choices
 * @param {import('discord.js').GuildMember} initiator
 * @param {import('discord.js').GuildMember} opponent
 * @param {lang} lang */
async function endGame(choices, initiator, opponent, lang) {
  await this.guild.deleteDB(`minigames.rps.${this.message.id}`);
  if (choices.player1 == choices.player2) this.message.embeds[0].data.description = lang('end.tie', emojis[choices.player1]);
  else {
    const winner = winningAgainst[choices.player1] == choices.player2 ? initiator.id : opponent.id;

    this.message.embeds[0].data.description = lang('end.win', {
      winner: userMention(winner), winEmoji: emojis[initiator.id == winner ? choices.player1 : choices.player2],
      loseEmoji: emojis[initiator.id == winner ? choices.player2 : choices.player1]
    });
  }

  const component = new ActionRowBuilder({
    components: [new ButtonBuilder({
      customId: `rps.${initiator.id}.playAgain.${opponent.id}`,
      label: lang('global.playAgain'),
      style: ButtonStyle.Success
    })]
  });

  return this.message.edit({ embeds: this.message.embeds, components: [component] });
}

/** @type {import('.').rps} */
module.exports = async function rps(lang, initiatorId, mode, opponentId) {
  if (this.user.id != initiatorId && this.user.id != opponentId) return;
  if (mode.length != 1) await this.deferUpdate();

  lang.config.backupPath[0] = 'commands.minigames.rps';

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
      this.message.embeds[0].data.description = lang(this.user.id == initiator.id ? 'canceled' : 'declined', inlineCode(this.member.displayName));
      return this.message.edit({ embeds: this.message.embeds, components: [] });

    case 'accept': if (opponent.user.bot || this.user.id == opponentId) return sendGame.call(this, initiator, opponent, lang); break;
    case 'playAgain':
      if (this.client.botType != 'dev')
        await this.client.db.update('botSettings', 'cmdStats.rps.slash', (this.client.settings.cmdStats.rps?.slash ?? 0) + 1);

      if (opponent.user.bot) return sendGame.call(this, initiator, opponent, lang);
      return sendChallenge.call(this, lang, this.member, initiatorId == this.user.id ? opponent : initiator);

    case 'rock':
    case 'paper':
    case 'scissors':
      return runGame.call(this, initiator, opponent, mode, lang);

    default: throw new Error('Unsupported mode');
  }
};