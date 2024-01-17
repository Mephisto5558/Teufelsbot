const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

/**@this import('discord-tictactoe') @param {Interaction}interaction @param {lang}lang*/
module.exports = async function playAgain(interaction, lang) {
  const
    opponent = interaction.options?.getUser('opponent'),
    { components: oldComponents } = await interaction.fetchReply(),
    components = oldComponents;

  if (!components[3]?.components[0]?.customId) components[3] = new ActionRowBuilder({
    components: [new ButtonBuilder({
      customId: 'playAgain',
      label: lang('global.playAgain'),
      style: ButtonStyle.Success
    })]
  });

  const collector = (await interaction.editReply({ components })).createMessageComponentCollector({
    filter: i => [interaction.user.id, opponent?.id].includes(i.member.id) && i.customId == 'playAgain',
    max: 1, componentType: ComponentType.Button, time: 15000
  });

  collector
    .on('collect', async PAButton => {
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
        sleep(5000).then(msg.delete.bind(msg));
      }

      this.handleInteraction(interaction);
    })
    .on('end', collected => {
      if (!collected.size) return;

      for (const row of oldComponents)
        for (const button of row.components) button.data.disabled = true;

      interaction.editReply({ components: oldComponents });
    });
};