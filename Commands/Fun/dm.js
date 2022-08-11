const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js');

module.exports = new Command({
  name: 'dm',
  aliases: { prefix: [], slash: [] },
  description: 'sends a user a dm',
  usage: '',
  permissions: { client: ['EmbedLinks'], user: [] },
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
      blacklist = await db.get('dmCommandBlacklist');

    let target = interaction.options.getMember('target');

    switch (cmd) {
      case 'toggle': {
        let
          message, newBlacklist, targetName,
          userBlacklist = blacklist[interaction.user.id] || [];
        if (target?.id) {
          target = target.id;
          targetName = lang('toggle.targetOne.name', target.tag);
        }
        else {
          target = '*';
          targetName = lang('toggle.targetAll.removed');
        }

        if (userBlacklist.includes(target)) {
          userBlacklist = userBlacklist.filter(entry => entry != target);

          message = lang('toggle.removed', targetName);
        }
        else {
          userBlacklist.push(target);

          message = lang('toggle.saved', targetName, target == '*' ? lang('toggle.targetAll.saved') : lang('toggle.targetOne.isnt', targetName));
        }

        if (userBlacklist?.length > 0) newBlacklist = Object.assign({}, blacklist, { [interaction.user.id]: userBlacklist });
        else delete blacklist[interaction.user.id];

        await db.set('dmCommandBlacklist', newBlacklist || blacklist);

        interaction.editReply(message);
        break;
      }

      case 'blacklist': {
        const guildMembers = (await interaction.guild.members.fetch()).map(e => e.id);

        const userBlacklist = await db.get('dmCommandBlacklist')[interaction.user.id]?.filter(e => e == '*' || guildMembers.includes(e));
        let listMessage = [];

        if (!userBlacklist) listMessage = lang('blacklist.notFound');
        else if (userBlacklist.includes('*')) listMessage = lang('blacklist.allBlocked');
        else for (const entry of userBlacklist) listMessage += `> <@${entry}> (\`${entry}\`)\n`;

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

        const userBlacklist = blacklist[target.id] || [];
        if ((userBlacklist.includes(target.id) || userBlacklist.includes('*')) && !asMod && target.id != interaction.user.id)
          return interaction.editReply(lang('send.permissionDenied') + perm ? lang('send.asModInfo') : '');

        const embed = new EmbedBuilder({
          title: lang('send.embedTitle'),
          description: lang('send.embedDescription', asMod ? lang('send.fromMod') : interaction.user.tag, interaction.guild.name) + messageToSend.replace(/\/n/g, '\n'),
          color: Colors.Blurple,
          footer: { text: lang('send.embedFooterText') }
        });

        try {
          await target.send({ embeds: [embed] });
          interaction.editReply(lang('general.messageSent'));
        }
        catch { interaction.editReply(lang('send.error')) }
        break;
      }
    }

  }
})
