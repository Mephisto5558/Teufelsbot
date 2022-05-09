const { Command } = require('reconlx'),
  TicTacToe = require('discord-tictactoe');

module.exports = new Command({
  name: 'tictactoe',
  alias: ['ttt'],
  description: 'play some ttt against a friend or the bot',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: '',
  slashCommand: true,
  prefixCommand: false,
  disabled: false,
  noDefer: true,
  options: [{
    name: 'opponent',
    description: 'who you want to play with',
    type: 'USER',
    required: false
  }],

  run: async(_, __, interaction) => {
    
    const game = new TicTacToe({ language: 'en' });
    game.handleInteraction(interaction)

  }
})

game.on('win', data => {
  //db, leaderboard and stuff

  interaction.update
});