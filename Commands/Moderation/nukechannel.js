/** @import { GuildTextBasedChannel, AnyThreadChannel } from 'discord.js' */

const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, ComponentType, Constants, EmbedBuilder, channelMention } = require('discord.js'),
  { getTargetChannel, timeFormatter: { msInSecond }, getCommandName, findPaths } = require('#Utils'),
  collectorTimeout = 3e4;

/** @type {command<'both'>} */
module.exports = {
  aliases: { prefix: ['clearchannel'], slash: ['clearchannel'] },
  permissions: { client: ['ManageChannels'], user: ['ManageGuild', 'ManageChannels'] },
  cooldowns: { guild: msInSecond * 10, user: msInSecond * 10 },
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'channel',
    type: 'Channel',
    channelTypes: Constants.GuildTextBasedChannelTypes.filter(e => !Constants.ThreadChannelTypes.includes(e))
  }],

  async run(lang) {
    const
      commandName = getCommandName.call(this.client, this.commandName),

      /** @type {Exclude<GuildTextBasedChannel, AnyThreadChannel>} */
      channel = getTargetChannel(this, { returnSelf: true }),
      embed = new EmbedBuilder({
        title: lang('confirmEmbedTitle'),
        description: lang('confirmEmbedDescription', channelMention(channel.id)),
        color: Colors.Red
      }),
      component = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: lang('confirmButtonLabel'),
            customId: `${commandName}.confirm`,
            style: ButtonStyle.Danger
          }),
          new ButtonBuilder({
            label: lang('cancelButtonLabel'),
            customId: `${commandName}.cancel`,
            style: ButtonStyle.Success
          })
        ]
      }),
      msg = await this.customReply({ embeds: [embed], components: [component] }),
      collector = msg.createMessageComponentCollector({
        filter: i => i.user.id == this.user.id, componentType: ComponentType.Button, max: 1, time: collectorTimeout
      });

    collector
      /* eslint-disable-next-line @typescript-eslint/strict-void-return -- this cannot be cleanly resolved. */
      .on('collect', async button => {
        const reply = await button.deferReply();

        if (button.customId == `${commandName}.cancel`) {
          void reply.delete();
          return collector.stop();
        }

        const
          nukedEmbed = new EmbedBuilder({
            description: lang('successEmbedDescription'),
            color: Colors.Red,
            image: { url: 'https://i.giphy.com/XUFPGrX5Zis6Y.gif' },
            footer: { text: lang('embedFooterText', this.user.username) }
          }),
          reason = lang('global.modReason', { command: commandName, user: this.user.username }),
          cloned = await channel.clone({ reason });

        await cloned.setPosition(channel.position, { reason }); // cannot be set in channel.clone and is not set automatically

        for (const [, webhook] of await channel.fetchWebhooks())
          await webhook.edit({ channel: cloned.id, reason });

        const settingsToMigrate = findPaths(this.guild.db, channel.id);
        await Promise.all(settingsToMigrate.values.map(async e => this.guild.updateDB(e, cloned.id)));
        await Promise.all(settingsToMigrate.keys.map(async e => {
          await this.guild.updateDB(`${e}.${cloned.id}`, this.client.db.get('guildSettings', `${this.guild.id}.${e}.${channel.id}`));
          await this.guild.deleteDB(`${e}.${channel.id}`);
        }));

        await channel.delete(reason);

        if (channel.id != this.channelId) {
          void reply.delete();
          void button.message.edit({ embeds: [embed.setDescription(lang('successEmbedDescription'))], components: [] });
        }

        return cloned.send({ embeds: [nukedEmbed] });
      })
      .on('end', collected => {
        for (const btn of component.components) btn.data.disabled = true;

        embed.data.description = collected.size ? lang('canceledEmbedDescription') : lang('global.menuTimedOut');
        return void msg.customReply({ embeds: [embed], components: [component] });
      });
  }
};