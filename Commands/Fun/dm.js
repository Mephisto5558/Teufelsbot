const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'dm',
  aliases: { prefix: [], slash: [] },
  description: 'sends a user a dm',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 100, user: 1000 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'toggle',
      description: 'toggles the ability to send you user-made dms',
      type: 'Subcommand',
      options: [
        {
          name: 'target',
          description: 'the user you want to toggle, leave this empty to toggle all users ("*").',
          type: 'User',
          required: false
        }
      ]
    },
    {
      name: 'blacklist',
      description: 'lists all users you are currently blocking.',
      type: 'Subcommand'
    },
    {
      name: 'send',
      description: 'send a dm to a user of this guild',
      type: 'Subcommand',
      options: [
        {
          name: 'target',
          description: 'the user you want to send a dm to',
          type: 'User',
          required: true
        },
        {
          name: 'message',
          description: `the message you want to send, /n for new line`,
          type: 'String',
          required: true
        },
        {
          name: 'as_mod',
          description: `shows 'a mod of {guild name}' instead of your name`,
          type: 'Boolean',
          required: false
        }
      ]
    }
  ],

  run: async (interaction, lang, { db, application }) => {

    const
      cmd = interaction.options.getSubcommand(),
      messageToSend = interaction.options.getString('message'),
      perm = interaction.member.permissions.has('ManageMessages'),
      asMod = (interaction.options.getBoolean('as_mod') && perm),
      oldData = db.get('userSettings'),
      blacklist = Object.assign({}, ...Object.entries(oldData).filter(([, v]) => v.dmBlockList).map(([k, v]) => ({ [k]: v.dmBlockList }))),
      userBlacklist = blacklist[interaction.user.id] || [];

    let target = interaction.options.getMember('target');

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

        db.set('userSettings', oldData.fMerge({ [interaction.user.id]: userBlacklist }));

        interaction.editReply(message);
        break;
      }

      case 'blacklist': {
        const guildMembers = (await interaction.guild.members.fetch()).map(e => e.id);

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

        interaction.editReply({ embeds: [listEmbed] });
        break;
      }

      case 'send': {
        if (target.id == application.id) return interaction.editReply(lang('send.targetIsMe'));

        const targetBlacklist = blacklist[target.id] || [];
        if ((targetBlacklist.includes(target.id) || targetBlacklist.includes('*')) && !asMod && target.id != interaction.user.id)
          return interaction.editReply(lang('send.permissionDenied') + perm ? lang('send.asModInfo') : '');

        const embed = new EmbedBuilder({
          title: lang('send.embedTitle'),
          description: lang('send.embedDescription', { user: asMod ? lang('send.fromMod') : interaction.user.tag, guild: interaction.guild.name, msg: messageToSend.replaceAll('/n', '\n') }),
          color: Colors.Blurple,
          footer: { text: lang('send.embedFooterText') }
        });

        try {
          await target.send({ embeds: [embed] });
          interaction.editReply(lang('global.messageSent'));
        }
        catch { interaction.editReply(lang('send.error')) }
        break;
      }
    }

  }
}