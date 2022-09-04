const
  { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, Message } = require('discord.js'),
  TicTacToe = require('discord-tictactoe'),
  game = new TicTacToe({
    simultaneousGames: true,
    gameExpireTime: 60
  });

function workStatsData(firstID, secondID, type, client) {
  if (!secondID || !client) throw new SyntaxError('you need to provide the secondID and client args');
  let against;
  switch (type) {
    case 'win': against = 'wonAgainst'; break
    case 'lose': against = 'lostAgainst'; break
    case 'draw': against = 'drewAgainst';
  }

  const stats = client.db.get('leaderboards').TicTacToe[firstID];
  const typeS = `${type}s`

  if (!stats) return { games: 1, [typeS]: 1, [against]: { [secondID]: 1 } };

  stats.games = stats.games ? parseInt(stats.games) + 1 : 1;
  stats[typeS] = stats[typeS] ? parseInt(stats[typeS]) + 1 : 1;

  if (!stats[against]) stats[against] = { [secondID]: 1 };
  else if (!stats[against][secondID]) stats[against][secondID] = 1;
  else stats[against][secondID] = parseInt(stats[against][secondID]) + 1;

  return stats;
}

async function gameEnd(input, ids, client) {
  const oldData = client.db.get('leaderboards');

  const newData = oldData.fMerge({ TicTacToe: { [ids[0]]: input[0], [ids[1]]: input[1] } });
  client.db.set('leaderboards', newData);
}

async function playAgain(message, clientUserID, lang) {
  const opponent = message.options.getUser('opponent') || message.mentions?.users?.first();
  const oldRows = (await message.fetchReply()).components;
  const filter = i => [message.member.id, opponent?.id].includes(i.member.id) && i.customId == 'playAgain';

  let rows = oldRows;

  const row = new ActionRowBuilder({
    components: [new ButtonBuilder({
      customId: 'playAgain',
      label: lang('global.playAgain'),
      style: ButtonStyle.Success
    })]
  })

  if (!rows[3]?.components[0].customId) rows[3] = row;

  await message.customReply({ components: rows });

  const collector = message.channel.createMessageComponentCollector({
    filter, max: 1, componentType: ComponentType.Button, time: 15000
  });

  collector.on('collect', async PAInteraction => {
    await PAInteraction.deferUpdate();
    await message.customReply({ components: [] });
    collector.stop();

    if (message.member.id != PAInteraction.member.id && opponent?.id != clientUserID) {
      if (opponent) {
        if (message instanceof Message) {
          message.mentions.users.clear();
          message.mentions.users.set(message.member.id, message.user);
        }
        else {
          message.options._hoistedOptions[0].member = message.member;
          message.options._hoistedOptions[0].user = message.user;
          message.options._hoistedOptions[0].value = message.member.id;

          message.options.data[0].member = message.member;
          message.options.data[0].user = message.user;
          message.options.data[0].value = message.member.id;

          message.options.resolved.members.set(message.member.id, message.member);
          message.options.resolved.users.set(message.member.id, message.user);
        }
      }

      message.member = PAInteraction.member;
      message.user = PAInteraction.user;
    }

    if (message.options._hoistedOptions[0]?.user) {
      const msg = await message.channel.send(lang('newChallenge', message.options._hoistedOptions[0].user.id));
      setTimeout(_ => msg.delete(), 5000);
    }

    message instanceof Message ? game.handleMessage(message) : game.handleInteraction(message);
  });

  collector.on('end', collected => {
    if (!collected.size) return;

    for (const row of oldRows) {
      for (const button of row.components) {
        button.setDisabled(true);
      }
    }

    message.customReply({ components: oldRows });
  })
}

module.exports = {
  name: 'tictactoe',
  aliases: { prefix: ['ttt'], slash: ['ttt'] },
  description: 'play some ttt against a friend or the bot',
  usage: '',
  permissions: { client: ['EmbedLinks', 'ManageMessages'], user: [] },
  cooldowns: { guild: 0, user: 2000 },
  category: 'Minigames',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'opponent',
    description: 'who you want to play with',
    type: 'User',
    required: false
  }],

  run: async (message, lang, client) => {
    return interaction.editReply("'This command is currently disabled due to it not being compatible to the bot's discord.js version.");

    const gameTarget = message.options?.getUser('opponent') || message.mentions?.users?.first();

    if (gameTarget?.id == client.user.id) game.config.commandOptionName = 'thisOptionWillNotGetUsed';
    game.config.language = client.db.get('guildSettings')[message.guild.id]?.config?.lang || message.guild.preferredLocale.slice(0, 2);

    if (gameTarget) {
      const msg = await message.channel.send(lang('newChallenge', gameTarget.id));
      setTimeout(msg.delete.bind(msg), 5000);
    }

    message instanceof Message ? game.handleMessage(message) : game.handleInteraction(message);

    game.on('win', async data => {
      let newData = [];

      newData[0] = await workStatsData(data.winner.id, data.loser.id, 'win', client);
      newData[1] = await workStatsData(data.loser.id, data.winner.id, 'lose', client);

      await gameEnd(newData, [data.winner.id, data.loser.id], client);
      playAgain(message, client.user.id, lang);
    });

    game.on('tie', async data => {
      let newData = [];

      newData[0] = await workStatsData(data.players[0].id, data.players[1].id, 'draw', client);
      newData[1] = await workStatsData(data.players[1].id, data.players[0].id, 'draw', client);

      await gameEnd(newData, [data.players[0].id, data.players[1].id], client);
      playAgain(message, client.user.id, lang);
    })

  }
}