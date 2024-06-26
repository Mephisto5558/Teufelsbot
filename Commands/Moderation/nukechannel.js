const { Constants, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

/** @type {command<'slash'>}*/
module.exports = {
  aliases: { prefix: ['clearchannel'], slash: ['clearchannel'] },
  permissions: { client: ['ManageChannels'], user: ['ManageGuild', 'ManageChannels'] },
  cooldowns: { guild: 1e4, user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'channel',
    type: 'Channel',
    channelTypes: Constants.TextBasedChannelTypes
  }],

  run: async function (lang) {
    const
      channel = this.options?.getChannel('channel') ?? this.mentions?.channels.first() ?? this.channel,
      embed = new EmbedBuilder({
        title: lang('confirmEmbedTitle'),
        description: lang('confirmEmbedDescription', channel.id),
        color: Colors.Red
      }),
      component = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: lang('confirmButtonLabel'),
            customId: 'nukechannel.confirm',
            style: ButtonStyle.Danger
          }),
          new ButtonBuilder({
            label: lang('cancelButtonLabel'),
            customId: 'nukechannel.cancel',
            style: ButtonStyle.Success
          })
        ]
      });

    const
      msg = await this.customReply({ embeds: [embed], components: [component] }),
      collector = msg.createMessageComponentCollector({ filter: i => i.user.id == this.user.id, componentType: ComponentType.Button, max: 1, time: 3e4 });

    collector
      .on('collect', async button => {
        const reply = await button.deferReply();

        if (button.customId == 'nukechannel.cancel') {
          reply.delete();
          return collector.stop();
        }

        const
          nukedEmbed = new EmbedBuilder({
            description: lang('successEmbedDescription'),
            color: Colors.Red,
            image: { url: 'https://i.giphy.com/XUFPGrX5Zis6Y.gif' },
            footer: { text: lang('embedFooterText', this.user.username) }
          }),
          cloned = await channel.clone({ reason: lang('global.modReason', { command: this.commandName, user: this.user.username }) });

        await channel.delete(lang('global.modReason', { command: this.commandName, user: this.user.username }));

        if (channel.id != this.channelId) {
          reply.delete();
          button.message.edit({ embeds: [embed.setDescription(lang('successEmbedDescription'))], components: [] });
        }

        return cloned.send({ embeds: [nukedEmbed] });
      })
      .on('end', collected => {
        for (const btn of component.components) btn.data.disabled = true;

        embed.data.description = collected.size ? lang('canceledEmbedDescription') : lang('global.menuTimedOut');
        return msg.customReply({ embeds: [embed], components: [component] });
      });
  }
};