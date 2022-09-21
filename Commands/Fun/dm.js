const { PermissionFlagsBits, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'dm',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 100, user: 1000 },
  category: 'Fun',
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

  run: async function (lang, { db, application }) {

    const
      cmd = this.options.getSubcommand(),
      messageToSend = this.options.getString('message'),
      perm = this.member.permissions.has(PermissionFlagsBits.ManageMessages),
      asMod = (this.options.getBoolean('as_mod') && perm),
      oldData = db.get('userSettings'),
      blacklist = Object.assign({}, ...Object.entries(oldData).filter(([, v]) => v.dmBlockList).map(([k, v]) => ({ [k]: v.dmBlockList }))),
      userBlacklist = blacklist[this.user.id] || [];

    let target = this.options.getMember('target');

    switch (cmd) {
      case 'toggle': {
        let message, targetName;

        if (target?.id) {
          target = target.id;
          targetName = lang('toggle.targetOne.name', target.tag);
        }
        else {
          target = '*';
          targetName = lang('toggle.targetAll.removed');
        }

        if (userBlacklist.includes(target)) {
          delete userBlacklist[target];

          message = lang('toggle.removed', targetName);
        }
        else {
          userBlacklist.push(target);

          message = lang('toggle.saved', { user: targetName, state: target == '*' ? lang('toggle.targetAll.saved') : lang('toggle.targetOne.isnt', targetName) });
        }

        db.set('userSettings', oldData.fMerge({ [this.user.id]: userBlacklist }));

        this.editReply(message);
        break;
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

        this.editReply({ embeds: [listEmbed] });
        break;
      }

      case 'send': {
        if (target.id == application.id) return this.editReply(lang('send.targetIsMe'));

        const targetBlacklist = blacklist[target.id] || [];
        if ((targetBlacklist.includes(target.id) || targetBlacklist.includes('*')) && !asMod && target.id != this.user.id)
          return this.editReply(lang('send.permissionDenied') + perm ? lang('send.asModInfo') : '');

        const embed = new EmbedBuilder({
          title: lang('send.embedTitle'),
          description: lang('send.embedDescription', { user: asMod ? lang('send.fromMod') : this.user.tag, guild: this.guild.name, msg: messageToSend.replaceAll('/n', '\n') }),
          color: Colors.Blurple,
          footer: { text: lang('send.embedFooterText') }
        });

        try {
          await target.send({ embeds: [embed] });
          this.editReply(lang('global.messageSent'));
        }
        catch { this.editReply(lang('send.error')) }
        break;
      }
    }

  }
}