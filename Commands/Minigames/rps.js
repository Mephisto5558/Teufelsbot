const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, ComponentType } = require('discord.js');

module.exports = {
  name: 'rps',
  aliases: { prefix: ['rockpaperscissors'] },
  slashCommand: true,
  prefixCommand: true,

  run: async function (lang) {
    const
      hand = new Collection([[lang('rock'), { id: 0, emoji: '✊' }], [lang('paper'), { id: 1, emoji: '🤚' }], [lang('scissors'), { id: 2, emoji: '✌️' }]]),
      originalData = {
        embeds: [new EmbedBuilder({ title: lang('embedTitle'), description: lang('embedDescription') }).setColor('Random')],
        components: [
          new ActionRowBuilder({
            components: [
              new ButtonBuilder({
                customId: '0',
                label: `✊ ${lang('rock')}`,
                style: ButtonStyle.Primary
              }),
              new ButtonBuilder({
                customId: '1',
                label: `🤚 ${lang('paper')}`,
                style: ButtonStyle.Primary
              }),
              new ButtonBuilder({
                customId: '2',
                label: `✌️ ${lang('scissors')}`,
                style: ButtonStyle.Primary
              })
            ]
          }),
          new ActionRowBuilder({
            components: [
              new ButtonBuilder({
                customId: 'cancel',
                label: lang('global.cancel'),
                style: ButtonStyle.Danger
              })
            ]
          })
        ]
      },
      msg = await this.customReply(originalData),
      collector = msg.createMessageComponentCollector({ filter: i => this.member.id == i.user.id, componentType: ComponentType.Button, idle: 15000 });

    let botMove = hand.random();
    let win;

    collector
      .on('collect', async button => {
        await button.deferUpdate();
        switch (button.customId) {
          case 'cancel': return collector.stop();
          case 'playAgain': {
            collector.empty();
            botMove = hand.random();
            msg.edit(originalData);
            break;
          }
          case '0':
          case '1':
          case '2': {
            const data = JSON.parse(JSON.stringify(originalData));

            if (botMove.id == button.customId) win = [lang('tie'), '='];
            else if (botMove.id < button.customId || botMove.id == 2 && !button.customId) win = [lang('win'), '>'];
            else win = [lang('lose'), '<'];

            data.embeds[0].description = lang('chose', { chose: [...hand.entries()].find(([, e]) => e.id == botMove.id)[0], win: win[0], you: hand.find(e => e.id == button.customId).emoji, symbol: win[1], i: botMove.emoji });
            for (const compButton of data.components[0].components) {
              if (compButton.custom_id == button.customId) button.style = ButtonStyle.Secondary;
              compButton.disabled = true;
            }

            data.components[1] = new ActionRowBuilder({
              components: [new ButtonBuilder({
                customId: 'playAgain',
                label: lang('global.playAgain'),
                style: ButtonStyle.Success
              })]
            });

            return msg.edit(data);
          }
        }
      })
      .on('end', collected => {
        if (!collected.size || collected.last().customId == 'cancel') originalData.embeds[0].data.description = lang('timedOut');

        for (const row of originalData.components) for (const button of row.components) button.setDisabled(true);

        return msg.edit(originalData);
      });
  }
};