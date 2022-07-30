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

  run: async ({ db, application }, interaction) => {

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
          targetName = `user \`${target.tag}\``;
        }
        else {
          target = '*';
          targetName = '`all users`';
        }

        if (userBlacklist.includes(target)) {
          userBlacklist = userBlacklist.filter(entry => entry != target);

          message =
            `Your blacklist entry for ${targetName} has been removed.\n` +
            `You can now receive dms created by ${targetName} from me.`;
        }
        else {
          userBlacklist.push(target);

          message =
            `Your blacklist entry for ${targetName} has been saved.\n` +
            `now ${target == '*' ? '`no one` will be' : `${targetName} isn't`} able to send you dms by me.\n` +
            'This will not prevent guild moderators from sending dms to you.';
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

        if (!userBlacklist) listMessage = '> You are not blocking any users on this guild.';
        else if (userBlacklist.includes('*')) listMessage = '> You are blocking all users.';
        else for (const entry of userBlacklist) listMessage += `> <@${entry}> (\`${entry}\`)\n`;

        const listEmbed = new EmbedBuilder({
          title: 'Your blacklist for the `/dm send` command',
          description:
            'You are blocking the following guild members:\n' +
            listMessage,
          color: Colors.Blurple,
          footer: {
            text:
              `run '/dm toggle' without arguments to toggle all users and\n` +
              `run '/dm toggle' with the 'user_to_toggle' argument to toggle a specific user.`
          }
        });

        interaction.editReply({ embeds: [listEmbed] });
        break;
      }

      case 'send': {
        if (target.id == application.id) return interaction.editReply('I cannot send DMs to myself!');

        const userBlacklist = blacklist[target.id] || [];
        if ((userBlacklist.includes(target.id) || userBlacklist.includes('*')) && !asMod && target.id != interaction.user.id) {
          return interaction.editReply({
            content:
              'You are not allowed to send dms to that user!' +
              `${perm ? '\nUse the `as_mod` option to force the message to send.' : ''}`
          });
        }

        const embed = new EmbedBuilder({
          title: 'You got a message!',
          description:
            `From: **${`\`${interaction.user.tag}\`` || 'a guild moderator'}**\n` +
            `Guild: \`${interaction.guild.name}\`\n\n` +
            messageToSend.replace(/\/n/g, '\n'),
          color: Colors.Blurple,
          footer: { text: "If you don't want to receive user-made dms from me, run '/dm toggle' in any server." }
        });

        try {
          await target.send({ embeds: [embed] });
          interaction.editReply('Message sent!');
        }
        catch { interaction.editReply(`I couldn't message this member!`) }
        break;
      }
    }

  }
})
