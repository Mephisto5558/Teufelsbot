const
  { Command } = require('reconlx'),
  { MessageButton, MessageActionRow } = require('discord.js'),
  TicTacToe = require('discord-tictactoe'),
  game = new TicTacToe({
    simultaneousGames: true,
    gameExpireTime: 60
  });

function workStatsData(firstID, secondID, type, client) {
  if (!secondID || !client) throw new SyntaxError('you need to provide the secondID and client args');
  let against;
  let stats = client.db.get('leaderboards').TicTacToe[firstID];

  switch (type) {
    case 'win': against = 'wonAgainst'; break;
    case 'lose': against = 'lostAgainst'; break;
    case 'draw': against = 'drewAgainst'; break;
    default: throw new SyntaxError('you need to provide the type: win, lose or draw');
  }

  const typeS = `${type}s`

  if (!stats) return { games: 1, [typeS]: 1, [against]: { [secondID]: 1 } };

  if (!stats.games) stats.games = 1;
  else stats.games = parseInt(stats.games) + 1;
  if (!stats[typeS]) stats[typeS] = 1;
  else stats[typeS] = parseInt(stats[typeS]) + 1;
  if (!stats[against]) stats[against] = { [secondID]: 1 };
  else if (!stats[against][secondID]) stats[against][secondID] = 1;
  else stats[against][secondID] = parseInt(stats[against][secondID]) + 1;

  return stats;
}

async function gameEnd(input, ids, client) {
  const oldData = await client.db.get('leaderboards');

  let data = Object.assign({},
    { [ids[0]]: input[0] },
    { [ids[1]]: input[1] }
  );

  data = Object.assign({}, oldData.TicTacToe, data);
  const newData = Object.assign({}, oldData, { TicTacToe: data });

  await client.db.set('leaderboards', newData);
}

async function playAgain(interaction, clientUserID) {
  const opponent = interaction.options.getUser('opponent');
  const oldRows = (await interaction.fetchReply()).components;
  let rows = oldRows;

  const filter = i => {
    if (
      [interaction.member.id, opponent?.id].includes(i.member.id) &&
      i.customId == 'playAgain'
    ) return true;
  }

  const row = new MessageActionRow({
    components: [new MessageButton({
      customId: 'playAgain',
      label: 'Play again',
      style: 'SUCCESS'
    })]
  })

  if (!rows[3]?.components[0].customId) rows[3] = row;

  await interaction.editReply({ components: rows });

  const collector = interaction.channel.createMessageComponentCollector({
    filter, max: 1, componentType: 'BUTTON', time: 15000
  });

  collector.on('collect', async PAInteraction => {
    await PAInteraction.deferUpdate();
    await interaction.editReply({ components: [] });
    collector.stop();

    if (interaction.member.id != PAInteraction.member.id && opponent?.id != clientUserID) {
      if (opponent) {
        interaction.options._hoistedOptions[0].member = interaction.member;
        interaction.options._hoistedOptions[0].user = interaction.user;
        interaction.options._hoistedOptions[0].value = interaction.member.id;

        interaction.options.data[0].member = interaction.member;
        interaction.options.data[0].user = interaction.user;
        interaction.options.data[0].value = interaction.member.id;

        interaction.options.resolved.members.set(interaction.member.id, interaction.member);
        interaction.options.resolved.users.set(interaction.member.id, interaction.user);
      }

      interaction.member = PAInteraction.member;
      interaction.user = PAInteraction.user;
    }

    if (interaction.options._hoistedOptions[0]?.user) {
      await interaction.channel.send(`<@${interaction.options._hoistedOptions[0].user.id}}> :crossed_swords: New duel challenge`)
        .then(msg => msg.delete({ timeout: 5000 }));
    }

    game.handleInteraction(interaction);
  });

  collector.on('end', collected => {
    if (collected.size != 0) return;

    for (const row of oldRows) {
      for (const button of row.components) {
        button.setDisabled(true);
      }
    }
    interaction.editReply({ components: oldRows });
  })
}

module.exports = new Command({
  name: 'tictactoe',
  aliases: ['ttt'],
  description: 'play some ttt against a friend or the bot',
  usage: '',
  permissions: { client: ['EMBED_LINKS'], user: [] },
  cooldowns: { guild: 0, user: 2000 },
  category: 'Minigames',
  slashCommand: true,
  prefixCommand: false,
  options: [{
    name: 'opponent',
    description: 'who you want to play with',
    type: 'USER',
    required: false
  }],

  run: async (client, _, interaction) => {
    const gameTarget = interaction.options.getUser('opponent');

    if (gameTarget?.id == client.user.id) game.config.commandOptionName = 'thisOptionWillNotGetUsed';
    game.config.language = interaction.guild.preferredLocale;

    if (gameTarget) {
      await interaction.channel.send(`<@${gameTarget.id}> :crossed_swords: New duel challenge`)
        .then(msg => msg.delete({ timeout: 5000 }));
    }

    game.handleInteraction(interaction);

    game.on('win', async data => {
      let newData = [];

      newData[0] = await workStatsData(data.winner.id, data.loser.id, 'win', client);
      newData[1] = await workStatsData(data.loser.id, data.winner.id, 'lose', client);

      await gameEnd(newData, [data.winner.id, data.loser.id], client);
      playAgain(interaction, client.user.id);
    });

    game.on('tie', async data => {
      let newData = [];

      newData[0] = await workStatsData(data.players[0].id, data.players[1].id, 'draw', client);
      newData[1] = await workStatsData(data.players[1].id, data.players[0].id, 'draw', client);

      await gameEnd(newData, [data.players[0].id, data.players[1].id], client);
      playAgain(interaction, client.user.id);
    })

  }
})