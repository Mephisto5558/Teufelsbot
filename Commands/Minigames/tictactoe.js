/**
 * @import { TicTacToe as TicTacToeT } from '#types/globals'
 * @import { GuildMember } from 'discord.js' */

const
  { Command, commandTypes } = require('@mephisto5558/command'),
  TicTacToe = require('discord-tictactoe'),
  { getTargetMembers, timeFormatter: { secsInMinute }, toMs: { secToMs } } = require('#Utils'),
  { sendChallengeMention } = require('#Utils/prototypeRegisterer'),

  againstStatIds = Object.freeze({ win: 'wonAgainst', lose: 'lostAgainst', draw: 'drewAgainst' }),
  typesStatIds = Object.freeze({ win: 'wins', lose: 'losses', draw: 'draws' });

/**
 * @this {GuildInteraction}
 * @param {GuildMember[]} players
 * @param {('win' | 'lose' | 'draw')[]} types
 * @param {lang} lang
 * @param {TicTacToeT} game */
async function eventCallback([player1, player2], [type1, type2 = type1], lang, game) {
  if (player1.id == this.client.user.id || player2.id == this.client.user.id) return;

  await updateStats(player1.id, player2.id, type1, this.client.db);
  await updateStats(player2.id, player1.id, type2, this.client.db);
  return game.playAgain(this, lang);
}

/**
 * @param {Snowflake} firstID
 * @param {Snowflake} secondID
 * @param {'win' | 'lose' | 'draw'} type
 * @param {Client['db']} db */
async function updateStats(firstID, secondID, type, db) {
  const stats = db.get('leaderboards', `TicTacToe.${firstID}`) ?? {};

  return Promise.all([
    db.update('leaderboards', `TicTacToe.${firstID}.games`, (stats.games ?? 0) + 1),
    db.update('leaderboards', `TicTacToe.${firstID}.${typesStatIds[type]}`, (stats[typesStatIds[type]] ?? 0) + 1),
    db.update('leaderboards', `TicTacToe.${firstID}.against.${secondID}`, (stats[againstStatIds[type]]?.[secondID] ?? 0) + 1)
  ]);
}

module.exports = new Command({
  types: [commandTypes.slash],
  aliases: { [commandTypes.slash]: ['ttt'], [commandTypes.prefix]: ['ttt'] },
  cooldowns: { user: secToMs(5) }, /* eslint-disable-line @typescript-eslint/no-magic-numbers */
  options: [{ name: 'opponent', type: 'User' }],

  async run(lang) {
    const
      gameTarget = getTargetMembers(this, { targetOptionName: 'opponent' })?.id,
      game = new TicTacToe({
        simultaneousGames: true,
        gameExpireTime: secsInMinute,
        language: lang.config.locale,
        commandOptionName: gameTarget == this.client.user.id ? 'thisOptionWillNotGetUsed' : 'opponent'
      });

    if (gameTarget) void sendChallengeMention(this, gameTarget, lang);

    game.on('win', async data => eventCallback.call(this, [data.winner, data.loser], ['win', 'lose'], lang, game));
    game.on('tie', async data => eventCallback.call(this, data.players, ['draw'], lang, game));

    return game.handleInteraction(this);
  }
});