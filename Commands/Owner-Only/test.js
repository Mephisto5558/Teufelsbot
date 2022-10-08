const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
module.exports = {
  name: 'test',
  aliases: { prefix: [], slash: [] },
  description: 'testing',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: true,
  prefixCommand: false,
  noDefer: true,
  beta: true,
  disabled: true,

  run: async (lang, client) => {
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
