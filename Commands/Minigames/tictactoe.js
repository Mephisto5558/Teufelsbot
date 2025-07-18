const
  TicTacToe = require('discord-tictactoe'),
  { getTargetMembers, timeFormatter: { secsInMinute }, toMs: { secToMs } } = require('#Utils'),
  { sendChallengeMention } = require('#Utils/prototypeRegisterer');

/**
 * @this {GuildInteraction}
 * @param {import('discord.js').GuildMember[]} players
 * @param {('win' | 'lose' | 'draw')[]} types
 * @param {lang} lang
 * @param {import('../../types/globals').TicTacToe} game */
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
  let against;

  switch (type) {
    case 'win': against = 'wonAgainst'; break;
    case 'lose': against = 'lostAgainst'; break;
    case 'draw': against = 'drewAgainst';
  }

  return Promise.all([
    db.update('leaderboards', `TicTacToe.${firstID}.games`, (stats.games ?? 0) + 1),
    db.update('leaderboards', `TicTacToe.${firstID}.${type}s`, (stats[`${type}s`] ?? 0) + 1),
    db.update('leaderboards', `TicTacToe.${firstID}.against.${secondID}`, (stats[against]?.[secondID] ?? 0) + 1)
  ]);
}

/** @type {command<'slash'>} */
module.exports = {
  aliases: { prefix: ['ttt'], slash: ['ttt'] },
  cooldowns: { user: secToMs(5) }, /* eslint-disable-line @typescript-eslint/no-magic-numbers */
  slashCommand: true,
  prefixCommand: false,
  options: [{ name: 'opponent', type: 'User' }],

  async run(lang) {
    const
      gameTarget = getTargetMembers(this, { targetOptionName: 'opponent' })?.id,
      game = new TicTacToe({
        simultaneousGames: true,
        gameExpireTime: secsInMinute,
        language: lang.__boundArgs__[0].locale,
        commandOptionName: gameTarget == this.client.user.id ? 'thisOptionWillNotGetUsed' : 'opponent'
      });

    if (gameTarget) void sendChallengeMention(this, gameTarget, lang);

    game.on('win', data => eventCallback.call(this, [data.winner, data.loser], ['win', 'lose'], lang, game));
    game.on('tie', data => eventCallback.call(this, data.players, ['draw'], lang, game));

    return game.handleInteraction(this);
  }
};