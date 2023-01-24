const { Constants, parseEmoji, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'selfrole',
  permissions: { client: ['ManageMembers'], user: ['ManageGuild'] },
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'add',
      type: 'Subcommand',
      options: [
        {
          name: 'message_id',
          type: 'String',
          required: true
        },
        {
          name: 'role',
          type: 'Role',
          required: true
        },
        {
          name: 'button_label',
          type: 'String',
          maxLength: 80,
          required: true
        },
        {
          name: 'modus',
          type: 'String',
          choices: ['add', 'remove', 'toggle']
        },
        {
          name: 'button_row',
          type: 'Number',
          choices: [1, 2, 3, 4, 5]
        },
        {
          name: 'button_color',
          type: 'Number',
          choices: [1, 2, 3, 4]
        },
        { name: 'hide_count', type: 'Boolean' },
        { name: 'content', type: 'String' },
        {
          name: 'channel',
          type: 'Channel',
          channelTypes: Constants.TextBasedChannelTypes
        }
      ]
    },
    {
      name: 'remove',
      type: 'Subcommand',
      options: [
        {
          name: 'message_id',
          type: 'String',
          required: true
        },
        {
          name: 'role',
          type: 'Role',
          required: true
        },
        { name: 'content', type: 'String' },
        {
          name: 'channel',
          type: 'Channel',
          channelTypes: Constants.TextBasedChannelTypes
        }
      ]
    }
  ],beta:true,

  run: async function (lang) {
    const
      msgId = this.options.getString('message_id'),
      role = this.options.getRole('role'),
      label = this.options.getString('label'),
      row = parseInt(this.options.getNumber('button_row')) - 1,
      channel = this.options.getChannel('channel') || this.channel,
      emoji = parseEmoji(this.options.getString('button_label')?.split(' ')[0] || '');

    let msg;
    try { msg = await channel.messages.fetch(msgId); }
    catch { return this.editReply(lang('invalidMsgId')); }
    if (msg.author.id != this.client.user.id) return this.editReply(lang('notMsgOwner'));

    switch (this.options.getSubcommand()) {
      case 'add': {
        if (role.comparePositionTo(this.guild.members.me.roles.highest) > -1) return this.editReply(lang('noPerm'));
        if (row && msg.components?.[4]?.components?.[4]) return this.editReply(lang('limitReached'));
        else if (msg.components?.[row] && msg.components[row].components?.[4]) return this.editReply(lang('rowFull'));

        const button = new ButtonBuilder({ style: this.options.getNumber('button_color') ?? ButtonStyle.Primary, customId: 'selfrole_button_preview' });

        if (emoji.id) button.data.emoji = emoji;
        else {
          button.data.label = label;
          if (!this.options.getBoolean('hide_count')) button.data.label = button.data.label.substring(0, 76) + ' [0]';
        }

        return (await this.editReply({ content: lang('preview', role.id), components: [new ActionRowBuilder({ components: [button] })] }))
          .createMessageComponentCollector({ componentType: ComponentType.Button, max: 1, time: 30000 }).on('collect', async b => {
            b.update({ fetchReply: false }).then(() => b.deleteReply());

            button.data.custom_id = `selfrole.${Date.now()}.${this.options.getString('modus') || 'toggle'}.${role.id}${this.options.getBoolean('hide_count') ? '' : '.count'}`;

            if (!msg.components[0]?.components?.length || msg.components[row > -1 ? row : msg.components.length - 1]?.components?.length == 5) msg.components.push(new ActionRowBuilder({ components: [button] }));
            else msg.components[row > -1 ? row : msg.components.length - 1].components.push(button);

            await msg.edit({ content: this.options.getString('content')?.replace('/n', '\n') || undefined, components: msg.components });
            this.editReply({ content: lang('addSuccess', msg.url), components: [] });
          }).on('end', collected => !collected.size && this.deleteReply().catch(() => { }));
      }

      case 'remove': {
        for (const comp of msg.components) comp.components = comp.components.filter(e => !e.data.custom_id.includes(role.id));
        await msg.edit({ content: this.options.getString('content'), components: msg.components.filter(e => e.components.length) });
        return this.editReply(lang('removeSuccess', msg.url));
      }

      case 'edit': {
        const
          comp = msg.components.find(e => e.components.find(e => e.data.label == this.options.getString('search_label')))?.components.find(e => e.data.label == this.options.getString('search_label'));
        if (!comp) return this.editReply(lang('editNotFound'));

        if (this.options.getBoolean('hide_count')) {
          comp.data.label = comp.data.label.replace(/ \[\d*\]$/, '');
          if (label) comp.data.label = label;
        }
        else if (label) comp.data.label = label.slice(0, 76) + (comp.data.label.match(/\[\d*\]$/) || ' [0]');

        return this.editReply(lang('editSuccess', msg.url));
      }
      default: throw new Error(`Unexpected subcommand name: "${this.options.getSubcommand()}"`);
    }
  }
};