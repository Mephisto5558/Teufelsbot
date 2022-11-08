const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
module.exports = {
  name: 'test',
  description: 'testing',
  slashCommand: true,
  prefixCommand: false,
  noDefer: true,
  beta: true,
  disabled: true,

  run: async () => {
    const modal = new ModalBuilder({
      title: 'This is a test!',
      customId: 'hax',
      components: [
        new ActionRowBuilder({
          components: [
            new TextInputBuilder({
              customId: 'textinput',
              label: 'Is Vinjago Dull?',
              style: TextInputStyle.Short
            })
          ]
        })
      ]
    });

    this.showModal(modal);
  }
};
