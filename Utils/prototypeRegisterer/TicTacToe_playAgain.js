const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js'),
  { msInSecond, secsInMinute } = require('../timeFormatter.js'),
  BUTTON_TIME = msInSecond * secsInMinute * 15; /* eslint-disable-line @typescript-eslint/no-magic-numbers -- 15s*/


/** @type {import('.').playAgain}*/
module.exports = async function playAgain(interaction, lang) {
  const
    opponent = interaction.options.getUser('opponent'),
    { components } = await interaction.fetchReply(),
    lastRow = 3;

  if (!components[lastRow]?.components[0]?.customId) {
    components[lastRow] = new ActionRowBuilder({
      components: [new ButtonBuilder({
        customId: 'playAgain',
        label: lang('global.playAgain'),
        style: ButtonStyle.Success
      })]
    });
  }

  const collector = (await interaction.editReply({ components })).createMessageComponentCollector({
    filter: i => [interaction.user.id, opponent?.id].includes(i.member.id) && i.customId == 'playAgain',
    max: 1, componentType: ComponentType.Button, time: BUTTON_TIME
  });

  collector
    .on('collect', /** @param {import('discord.js').ButtonInteraction}PAButton*/async PAButton => {
      void PAButton.deferUpdate();
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
        const
          msg = await interaction.channel.send(lang('newChallenge', interaction.options._hoistedOptions[0].user.id)),
          sleepTime = 5000;

        void sleep(sleepTime).then(msg.delete.bind(msg));
      }

      return this.handleInteraction(interaction);
    })
    .on('end', collected => {
      if (!collected.size) return;

      for (let i = 0; i < lastRow; i++) for (const button of components[i].components) button.data.disabled = true;

      return interaction.editReply({ components });
    });
};