import { ActionRowBuilder, ButtonBuilder, ButtonStyle, DiscordAPIError, EmbedBuilder, MessageFlags, inlineCode, userMention } from 'discord.js';
import sendChallenge from './rps_sendChallenge.ts';
import DiscordAPIErrorCodes from '../DiscordAPIErrorCodes.json' with { type: 'json' };

import type { ButtonInteraction, GuildMember } from 'discord.js';
import type { GuildButtonInteraction, Response } from './index.ts';

type PlayOptions = NonNullable<NonNullable<Database['guildSettings'][Snowflake]['minigames']>['rps'][Snowflake]['player1']>;


const
  emojis = { rock: '✊', paper: '🤚', scissors: '✌️' } as const,
  winningAgainst = { rock: 'scissors', paper: 'rock', scissors: 'paper' } as const;

async function sendGame(
  this: ButtonInteraction<'cached'>,
  initiator: GuildMember, opponent: GuildMember, lang: lang
): ReturnType<Message['edit']> {
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

async function runGame(
  this: ButtonInteraction<'cached'>,
  initiator: GuildMember, opponent: GuildMember, mode: PlayOptions, lang: lang
): ReturnType<Message['edit']> {
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

async function endGame(
  this: ButtonInteraction<'cached'>,
  choices: Record<`player${1 | 2}`, PlayOptions>, initiator: GuildMember, opponent: GuildMember, lang: lang
): ReturnType<Message['edit']> {
  await this.guild.deleteDB(`minigames.rps.${this.message.id}`);
  if (choices.player1 == choices.player2) this.message.embeds[0].data.description = lang('end.tie', emojis[choices.player1]);
  else {
    const winner = (winningAgainst[choices.player1] == choices.player2 ? initiator : opponent).id;

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

export default async function rps<
  INITIATOR_ID extends Snowflake, MODE extends 'cancel' | 'decline' | 'accept' | 'playAgain' | PlayOptions,
  OPPONENT_ID extends Snowflake
>(
  this: GuildButtonInteraction & { customId: `rps.${INITIATOR_ID}.${MODE}.${OPPONENT_ID}` },
  lang: lang, initiatorId: INITIATOR_ID, mode: MODE, opponentId: OPPONENT_ID
): Promise<Response<true>> {
  if (this.user.id != initiatorId && this.user.id != opponentId) return;
  if (mode.length != 1) await this.deferUpdate();

  lang.config.backupPaths[0] = 'commands.minigames.rps';

  let initiator, opponent;
  try {
    initiator = await this.guild.members.fetch(initiatorId);
    opponent = await this.guild.members.fetch(opponentId);
  }
  catch (err) {
    if (!(err instanceof DiscordAPIError) || err.code != DiscordAPIErrorCodes.UnknownMember) throw err;

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
}