const { PermissionFlagsBits, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'dm',
  cooldowns: { guild: 100, user: 1000 },
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'toggle',
      type: 'Subcommand',
      options: [
        { name: 'target', type: 'User' }
      ]
    },
    { name: 'blacklist', type: 'Subcommand' },
    {
      name: 'send',
      type: 'Subcommand',
      options: [
        {
          name: 'target',
          type: 'User',
          required: true
        },
        {
          name: 'message',
          type: 'String',
          required: true
        },
        { name: 'as_mod', type: 'Boolean' }
      ]
    }
  ],

  run: async function (lang) {

    const
      cmd = this.options.getSubcommand(),
      messageToSend = this.options.getString('message'),
      perm = this.member.permissions.has(PermissionFlagsBits.ManageMessages),
      asMod = (this.options.getBoolean('as_mod') && perm),
      blacklist = Object.assign({}, ...Object.entries(this.client.db.get('userSettings') || {}).filter(([, v]) => v.dmBlockList).map(([k, v]) => ({ [k]: v.dmBlockList }))),
      userBlacklist = blacklist[this.user.id] || [],
      target = this.options.getMember('target') ?? { id: '*' };

    switch (cmd) {
      case 'toggle': {
        const targetName = target.id ? lang('toggle.targetOne.name', target.tag) : lang('toggle.targetAll.removed');

        userBlacklist.includes(target.id) ? delete userBlacklist[target.id] : userBlacklist.push(target.id);
        this.client.db.update('userSettings', this.user.id, userBlacklist);

        if (userBlacklist.includes(target.id)) return this.editReply(lang('toggle.saved', { user: targetName, state: target.id == '*' ? lang('toggle.targetAll.saved') : lang('toggle.targetOne.isnt', targetName) }));
        return this.editReply(lang('toggle.removed', targetName));
      }

      case 'blacklist': {
        const guildMembers = (await this.guild.members.fetch()).map(e => e.id);

        const userBlacklistFiltered = userBlacklist.filter(e => e == '*' || guildMembers.includes(e));
        let listMessage = [];

        if (!userBlacklistFiltered) listMessage = lang('blacklist.notFound');
        else if (userBlacklistFiltered.includes('*')) listMessage = lang('blacklist.allBlocked');
        else for (const entry of userBlacklistFiltered) listMessage += `> <@${entry}> (\`${entry}\`)\n`;

        const listEmbed = new EmbedBuilder({
          title: lang('blacklist.embedTitle'),
          description: lang('blacklist.embedDescription', listMessage),
          color: Colors.Blurple,
          footer: { text: lang('blacklist.embedFooterText') }
        });

        return this.editReply({ embeds: [listEmbed] });
      }

      case 'send': {
        if (target.id == this.client.user.id) return this.editReply(lang('send.targetIsMe'));

        const targetBlacklist = blacklist[target.id] || [];
        if ((targetBlacklist.includes(target.id) || targetBlacklist.includes('*')) && !asMod && target.id != this.user.id)
          return this.editReply(lang('send.permissionDenied') + (perm ? lang('send.asModInfo') : ''));

        const embed = new EmbedBuilder({
          title: lang('send.embedTitle'),
          description: lang('send.embedDescription', { user: asMod ? lang('send.fromMod') : this.user.tag, guild: this.guild.name, msg: messageToSend.replaceAll('/n', '\n') }),
          color: Colors.Blurple,
          footer: { text: asMod ? undefined : lang('send.embedFooterText') }
        });

        try {
          await target.send({ embeds: [embed] });
          return this.editReply(lang('global.messageSent'));
        }
        catch { return this.editReply(lang('send.error')); }
      }
    }

  }
};