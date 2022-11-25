const
  { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js'),
  TicTacToe = require('discord-tictactoe');

function eventCallback([player1, player2], [type1, type2 = type1], lang, game) {
  updateStats(player1.id, player2.id, type1, this.client);
  updateStats(player2.id, player1.id, type2, this.client);
  game.playAgain.call(this, game, lang);
}

if (!TicTacToe.prototype.playAgain) TicTacToe.prototype.playAgain = async function playAgain(game, lang) {
  const
    opponent = this.options?.getUser('opponent'),
    oldRows = (await this.fetchReply()).components;

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

  const msg = await this.editReply({ components: rows });

  const collector = msg.createMessageComponentCollector({
    filter: i => [this.member.id, opponent?.id].includes(i.member.id) && i.customId == 'playAgain',
    max: 1, componentType: ComponentType.Button, time: 15000
  });

  collector.on('collect', async PAButton => {
    PAButton.deferUpdate();
    collector.stop();

    if (this.member.id != PAButton.member.id && opponent?.id != this.client.user.id) {
      if (opponent) {
        this.options._hoistedOptions[0].member = this.member;
        this.options._hoistedOptions[0].user = this.user;
        this.options._hoistedOptions[0].value = this.member.id;

        this.options.data[0].member = this.member;
        this.options.data[0].user = this.user;
        this.options.data[0].value = this.member.id;

        this.options.resolved.members.set(this.member.id, this.member);
        this.options.resolved.users.set(this.member.id, this.user);
      }

      this.member = PAButton.member;
      this.user = PAButton.user;
    }

    if (this.options._hoistedOptions[0]?.user) {
      const msg = await this.channel.send(lang('newChallenge', this.options._hoistedOptions[0].user.id));
      setTimeout(() => msg.delete(), 5000);
    }

    game.handleInteraction(this);
  });

  collector.on('end', collected => {
    if (!collected.size) return;

    for (const row of oldRows)
      for (const button of row.components) button.data.disabled = true;

    this.editReply({ components: oldRows });
  });
};

function updateStats(firstID, secondID, type, { db }) {
  const stats = db.get('leaderboards').TicTacToe[firstID] || {};
  let against;

  switch (type) {
    case 'win': against = 'wonAgainst'; break;
    case 'lose': against = 'lostAgainst'; break;
    case 'draw': against = 'drewAgainst';
  }

  db.update('leaderboards', `TicTacToe.${firstID}`, {
    games: stats.games + 1 || 1,
    [`${type}s`]: stats[`${type}s`] + 1 || 1,
    [against]: { [secondID]: stats[against]?.[secondID] + 1 || 1 }
  });
}

module.exports = {
  name: 'tictactoe',
  aliases: { slash: ['ttt'] },
  permissions: { client: ['ManageMessages'] },
  cooldowns: { user: 2000 },
  slashCommand: true,
  prefixCommand: false,
  options: [{ name: 'opponent', type: 'User' }],

  run: async function (lang) {
    const
      gameTarget = this.options?.getUser('opponent'),
      game = new TicTacToe({
        simultaneousGames: true,
        gameExpireTime: 60,
        language: this.guild.db.config?.lang || this.guild.preferredLocale.slice(0, 2),
        commandOptionName: gameTarget?.id == this.client.user.id ? 'thisOptionWillNotGetUsed' : 'opponent'
      });

    if (gameTarget) {
      const msg = await this.channel.send(lang('newChallenge', gameTarget.id));
      setTimeout(() => msg.delete(), 5000);
    }

    game.handleInteraction(this);

    game.on('win', data => eventCallback.call(this, [data.winner, data.loser], ['win', 'lose'], lang, game));
    game.on('tie', data => eventCallback.call(this, data.players, ['draw'], lang, game));
  }
};