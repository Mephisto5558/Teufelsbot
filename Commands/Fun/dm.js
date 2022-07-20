const
  { Command } = require('reconlx'),
  { EmbedBuilder } = require('discord.js'),
  { colors } = require('../../Settings/embed.json');

module.exports = new Command({
  name: 'dm',
  aliases: { prefix: [], slash: [] },
  description: 'sends a user a dm',
  usage: '',
  permissions: { client: ['EMBED_LINKS'], user: [] },
  cooldown: { guild: 100, user: 1000 },
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
          name: 'user_to_toggle',
          description: 'the user you want to toggle, leave this empty to toggle all users ("*").',
          type: 'User',
          required: false
        }
      ]
    },
    {
      name: 'list',
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

  run: async (client, _, interaction) => {

    const
      cmd = interaction.options.getSubcommand(),
      userToToggle = interaction.options.getUser('user_to_toggle'),
      messageTarget = interaction.options.getMember('target'),
      messageToSend = interaction.options.getString('message'),
      perm = interaction.member.permissions.has('MANAGE_MESSAGES'),
      asMod = (interaction.options.getBoolean('as_mod') && perm),
      blacklist = await client.db.get('dmCommandBlacklist');

    let message, newBlacklist, userBlacklist;

    switch (cmd) {
      case 'toggle':
        userBlacklist = blacklist[interaction.member.id] || [];
        if (userToToggle?.id) {
          target = userToToggle.id;
          targetName = `user \`${userToToggle.tag}\``
        }
        else {
          target = '*';
          targetName = 'all users'
        }

        if (userBlacklist.includes(target)) {
          userBlacklist = userBlacklist.filter(entry => entry != target);

          message =
            `Your blacklist entry for \`${targetName}\` has been removed.\n` +
            `You can now receive dms created by ${targetName} from me.`;
        }
        else {
          userBlacklist.push(target);

          message =
            `Your blacklist entry for ${targetName} has been saved.\n` +
            `now ${target == '*' ? '`no one` will be' : `\`${targetName}\` isn't able`} able to send you dms by me.\n` +
            'This will not prevent guild moderators from sending dms to you.';
        }

        if (userBlacklist?.length > 0) newBlacklist = await Object.assign({}, blacklist, { [interaction.member.id]: userBlacklist });
        else delete blacklist[interaction.member.id];

        await client.db.set('dmCommandBlacklist', newBlacklist || blacklist);

        interaction.editReply(message);
        break;

      case 'list':
        userBlacklist = (await client.db.get('dmCommandBlacklist'))[interaction.user.id],
          listMessage = [];

        if (!userBlacklist) listMessage = '> You are not blocking any users.';
        else if (userBlacklist.includes('*')) listMessage = '> You are blocking all users.'
        else {
          for (const entry of userBlacklist) {
            await client.lastRateLimitCheck(`/guilds/${interaction.guild.id}/members/:id`);
            try {
              await interaction.guild.members.fetch(entry);
            } catch { continue }
            listMessage += `> <@${entry}> (${entry})\n`;
          }
        }

        const listEmbed = new EmbedBuilder({
          title: 'Your blacklist for the `/dm send` command',
          description:
            'You are blocking the following guild members:\n' +
            listMessage,
          color: colors.discord.BURPLE,
          footer: {
            text:
              `run '/dm toggle' without arguments to toggle all users and\n` +
              `run '/dm toggle' with the 'user_to_toggle' argument to toggle a specific user.`
          }
        });

        interaction.editReply({ embeds: [listEmbed] });
        break;

      case 'send':
        userBlacklist = blacklist[messageTarget.id] || [];

        if ((userBlacklist.includes(messageTarget.id) || userBlacklist.includes('*')) && !asMod) {
          const errorMsg =
            'You are not allowed to send dms to that user!' +
            `${perm ? '\nUse the `as_mod` option to force the message to send.' : ''}`;

          return interaction.editReply({ content: errorMsg });
        }

        let embed = new EmbedBuilder({
          title: 'You got a message!',
          description:
            `From: **${`\`${interaction.user.tag}\`` || 'a guild moderator'}**\n` +
            `Guild: \`${interaction.guild.name}\`\n\n` +
            messageToSend.replace(/\/n/g, '\n'),
          color: colors.discord.BURPLE,
          footer: {
            text:
              `If you don't want to receive user-made dms from me, run /dm toggle in any server.\n` +
              'If someone abuses this command to spam, please message the dev.'
          }
        });

        try {
          await messageTarget.send({ embeds: [embed] });
          interaction.editReply('Message sent!');
        }
        catch {
          interaction.editReply(`I couldn't message this member!`)
        };
        break;

      default: throw new SyntaxError(`The arg '${cmd}' of let cmd is not handled`);
    }

  }
})