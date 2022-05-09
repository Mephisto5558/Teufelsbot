const { Command } = require('reconlx'),
  TicTacToe = require('discord-tictactoe')
const game = new TicTacToe({ language: 'en' })

module.exports = new Command({
  name: 'tictactoe',
  alias: [],
  description: 'play some ttt against a friend or the bot',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: '',
  slashCommand: true,
  prefixCommand: false,
  disabled: false,
  options: [{
    name: 'opponent',
    description: 'who you want to play with',
    type: 'USER',
    required: false
  }],

  run: async(_, __, interaction) => {

    game.handleInteraction(interaction);

  }
})