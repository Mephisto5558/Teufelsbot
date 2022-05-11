const { Command } = require('reconlx'),
  { MessageActionRow, MessageButton } = require('discord.js'),
  TicTacToe = require('discord-tictactoe');

function playAgain(interaction) {
  const filter = i => {
    if(i.member.id == interaction.member.id) return true;
    else if(opponent && i.member.id == opponent) return true;
    else return false;
    console.log(i.member.id == interaction.member.id,opponent && i.member.id == opponent)
  };
  
  let row = new MessageActionRow().addComponents(
    new MessageButton()
	    .setCustomId('retry')
		  .setLabel('Play again')
		  .setStyle('SUCCESS')
  );
  interaction.followUp({content: 'WIP q_q | Play again?', components: [row] });
  
  const collector = interaction.channel.createMessageComponentCollector({
    filter, max: 1, componentType: 'BUTTON', time: 10000
  });

  collector.on('collect', interaction => {
    new TicTacToe({ language: 'en' }).handleInteraction(interaction)
  })
}

module.exports = new Command({
  name: 'tictactoe',
  aliases: ['ttt'],
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
    
    game.handleInteraction(interaction);

    game.on('win', data => {
      //db, leaderboard and stuff 
    
      playAgain(interaction)
    });
    
    game.on('tie', data => {
      //db, leaderboard and stuff
    
      playAgain(interaction)
    })

  },
})
