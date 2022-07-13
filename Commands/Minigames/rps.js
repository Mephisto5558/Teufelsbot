const
  { Command } = require('reconlx'),
  { MessageEmbed, MessageActionRow, MessageButton, Collection } = require('discord.js'),
  hand = new Collection([['Rock', { id: 0, emoji: '✊' }], ['Paper', { id: 1, emoji: '🤚' }], ['Scissors', { id: 2, emoji: '✌️' }]]);

module.exports = new Command({
  name: 'rps',
  aliases: { prefix: [], slash: [] },
  description: 'Play rock paper scissors against the bot or (coming soon) your friends!',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Minigames',
  slashCommand: true,
  prefixCommand: true,

  run: async (_, message, interaction) => {
    if (interaction) message = interaction;

    const
      botMove = hand.random(),
      chooseEmbed = new MessageEmbed({ title: 'Rock Paper Scissors', description: 'Choose a handsign!', color: 'RANDOM' }),
      chooseButtons = new MessageActionRow({
        components: [
          new MessageButton({
            customId: '0',
            label: '✊ Rock',
            style: 'PRIMARY'
          }),
          new MessageButton({
            customId: '1',
            label: '🤚 Paper',
            style: 'PRIMARY'
          }),
          new MessageButton({
            customId: '2',
            label: '✌️ Scissors',
            style: 'PRIMARY'
          }),
        ]
      });

    if (interaction) interaction.editReply({ embeds: [chooseEmbed], components: [chooseButtons] });
    else message = await message.reply({ embeds: [chooseEmbed], components: [chooseButtons] });

    const collector = message.channel.createMessageComponentCollector({ max: 1, componentType: 'BUTTON', time: 10000 });

    collector.on('collect', async button => {
      await button.deferUpdate();

      const win = botMove.id == button.customId ? ['We tied!','='] : (botMove.id == 0 && button.customId == 1 || botMove.id == 1 && button.customId == 2 || botMove.id == 2 && button.customId == 0 ? ['You win!','>'] : ['You lost!', '<']);
      chooseEmbed.description = `I chose ${[...hand.entries()].find(([,e]) => e.id == botMove.id)[0]}! ${win[0]} (${hand.find(e=> e.id == button.customId).emoji} ${win[1]} ${botMove.emoji})`;

      for (const comp of chooseButtons.components) {
        if (comp.customId == button.customId) comp.style = 'SECONDARY';
        comp.disabled = true;
      }

      if (interaction) interaction.editReply({ embeds: [chooseEmbed], components: [chooseButtons] });
      else message.edit({ embeds: [chooseEmbed], components: [chooseButtons] });
    });

  }
})