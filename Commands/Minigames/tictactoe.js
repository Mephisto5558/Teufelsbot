const
  { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js'),
  TicTacToe = require('discord-tictactoe'),
  eventCallback = ([player1, player2], [type1, type2 = type1], interaction, lang, game) => {
    updateStats(player1.id, player2.id, type1, interaction.client);
    updateStats(player2.id, player1.id, type2, interaction.client);
    game.playAgain(interaction, lang);
  };

if (!TicTacToe.prototype.playAgain) TicTacToe.prototype.playAgain = async function playAgain(interaction, lang) {
  const
    opponent = interaction.options?.getUser('opponent') || interaction.mentions?.users?.first(),
    oldRows = (await interaction.fetchReply()).components;

  let rows = oldRows;

  if (!rows[3]?.components[0].customId) {
    rows[3] = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          customId: 'playAgain',
          label: lang('global.playAgain'),
          style: ButtonStyle.Success
        })
      ]
    });
  }

  const msg = await interaction.editReply({ components: rows });

  const collector = msg.createMessageComponentCollector({
    filter: i => [interaction.member.id, opponent?.id].includes(i.member.id) && i.customId == 'playAgain',
    max: 1, componentType: ComponentType.Button, time: 15000
  });

  collector.on('collect', async PAButton => {
    PAButton.deferUpdate();
    collector.stop();

    if (interaction.member.id != PAButton.member.id && opponent?.id != interaction.client.user.id) {
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

      interaction.member = PAButton.member;
      interaction.user = PAButton.user;
    }

    if (interaction.options._hoistedOptions[0]?.user) {
      const msg = await interaction.channel.send(lang('newChallenge', interaction.options._hoistedOptions[0].user.id));
      setTimeout(_ => msg.delete(), 5000);
    }

    this.handleInteraction(interaction);
  });

  collector.on('end', collected => {
    if (!collected.size) return;

    for (const row of oldRows)
      for (const button of row.components) button.data.disabled = true;

    interaction.editReply({ components: oldRows });
  });
}

function updateStats(firstID, secondID, type, { db }) {
  const stats = db.get('leaderboards').TicTacToe[firstID] || {};
  let against;

  switch (type) {
    case 'win': against = 'wonAgainst'; break
    case 'lose': against = 'lostAgainst'; break
    case 'draw': against = 'drewAgainst';
  }

  return db.set('leaderboards', db.get('leaderboards').fMerge({
    TicTacToe: {
      [firstID]: {
        games: parseInt(stats.games || 0) + 1,
        [`${type}s`]: parseInt(stats[`${type}s`] || 0) + 1,
        [against]: { [secondID]: parseInt(stats[against]?.[secondID] || 0) + 1 }
      }
    }
  }));
}

module.exports = {
  name: 'tictactoe',
  aliases: { prefix: [], slash: ['ttt'] },
  permissions: { client: ['ManageMessages'], user: [] },
  cooldowns: { guild: 0, user: 2000 },
  category: 'Minigames',
  slashCommand: true,
  prefixCommand: false,
  options: [{ name: 'opponent', type: 'User' }],

  run: async (interaction, lang, { user, db }) => {
    const
      gameTarget = interaction.options?.getUser('opponent'),
      game = new TicTacToe({
        simultaneousGames: true,
        gameExpireTime: 60,
        language: db.get('guildSettings')[interaction.guild.id]?.config?.lang || interaction.guild.preferredLocale.slice(0, 2),
        commandOptionName: gameTarget?.id == user.id ? 'thisOptionWillNotGetUsed' : 'opponent'
      });

    if (gameTarget) {
      const msg = await interaction.channel.send(lang('newChallenge', gameTarget.id));
      setTimeout(_ => msg.delete(), 5000);
    }

    game.handleInteraction(interaction);

    game.on('win', data => eventCallback([data.winner, data.loser], ['win', 'lose'], interaction, lang, game));
    game.on('tie', data => eventCallback(data.players, ['draw'], interaction, lang, game));
  }
}