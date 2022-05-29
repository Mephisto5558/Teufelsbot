const
  { Command } = require("reconlx"),
  { MessageEmbed } = require("discord.js"),
  colorConfig = require('../../Settings/embed.json').colors;

module.exports = new Command({
  name: 'dm',
  aliases: [],
  description: 'sends a user a dm',
  permissions: { client: [], user: [] },
  cooldown: { global: '', user: '' },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: false,
  noDefer: true,
  options: [
    {
      name: 'toggle',
      description: 'toggles the ability to send you user-made dms',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'user_to_toggle',
          description: 'the user you want to toggle, leave this empty to toggle all users ("*").',
          type: 'USER',
          required: false
        }
      ]
    },
    {
      name: 'list',
      description: 'lists all users you are currently blocking.',
      type: 'SUB_COMMAND'
    },
    {
      name: 'send',
      description: 'send a dm to a user of this guild',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'target',
          description: 'the user you want to send a dm to',
          type: 'USER',
          required: true
        },
        {
          name: 'message',
          description: `the message you want to send, /n for new line`,
          type: 'STRING',
          required: true
        },
        {
          name: 'as_mod',
          description: `shows 'a mod of {guild name}' instead of your name`,
          type: 'BOOLEAN',
          required: false
        }
      ]
    }
  ],

  run: async (client, _, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    let
      message, messageSender, newBlacklist,
      blacklist = await client.db.get('dmCommandBlacklist'),
      userBlacklist = blacklist[interaction.member.id] || [],
      cmd = interaction.options.getSubcommand(),
      userToToggle = interaction.options.getUser('user_to_toggle'),
      messageTarget = interaction.options.getMember('target'),
      messageToSend = interaction.options.getString('message'),
      perm = interaction.member.permissions.has('MANAGE_MESSAGES'),
      asMod = (interaction.options.getBoolean('as_mod') && perm);

    if (!asMod) messageSender = `\`${interaction.user.tag}\``;

    switch (cmd) {
      case 'toggle':
        if(userToToggle?.id) {
          target = userToToggle.id;
          targetName = `user ${userToToggle.tag}`
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

          message = `Your blacklist entry for \`${targetName}\` has been saved\n.`;
          if(target == '*') message += `now \`no one\` will be able to send you dms by me\n.`;
          else message += `now \`${targetName}\` isn't able to send you dms by me\n.`;
          message += 'This will not prevent guild moderators from sending dms to you.';
        }

        if(userBlacklist?.length > 0) newBlacklist = await Object.assign({}, blacklist, { [interaction.member.id]: userBlacklist });
        else delete blacklist[interaction.member.id];

        await client.db.set('dmCommandBlacklist', newBlacklist || blacklist);

        interaction.editReply({
          content: message,
          ephemeral: true
        });
        break;

      case 'list':
        let data = (await client.db.get("dmCommandBlacklist"))[interaction.user.id];
        let dataFetched = await interaction.guild.members.fetch(data);
        let i = 0;
        let listMessage = [];

        if(!data) listMessage = 'You are not blocking any users.';
        else if(data.includes('*')) listMessage = 'You are blocking all users.'
        else {
          for (entry in data) {
            listMessage += `<@${data}> (${dataFetched[i]})\n`;
            i++;
          }
        }

        let listEmbed = new MessageEmbed()
          .setTitle('Your blacklist for the `/dm send` command')
          .setDescription(listMessage)
          .setColor(colorConfig.discord.BURPLE)
          .setFooter({
            text:
              "run '/dm toggle' without arguments to toggle all users and\n" +
              "run '/dm toggle' with the 'user_to_toggle' argument to toggle a specific user."
          })

        interaction.editReply({ embeds: [listEmbed] });
        break;

      case 'send':
        if ((userBlacklist.includes(messageTarget.id) || userBlacklist.includes('*')) && !asMod) {
          let errorMsg = 'You are not allowed to send dms to that user!';
          if (perm) errorMsg += '\nUse the `as_mod` option to force the message to send.';

          return interaction.editReply({
            content: errorMsg,
            ephemeral: true
          });
        }

        let embed = new MessageEmbed()
          .setTitle('You got a message!')
          .setDescription(
            `From: **${messageSender || 'a guild moderator'}**\n` +
            `Guild: \`${interaction.guild.name}\`\n\n` +
            messageToSend
          )
          .setColor(colorConfig.discord.BURPLE)
          .setFooter({
            text:
              "If you don't want to receive user-made dms from me, run /dm toggle in any server.\n" +
              'If someone abuses this command to spam you, please message me.'
          });

        messageTarget
          .send({ embeds: [embed] })
          .then(
            interaction.editReply({
              content: 'Message sent!',
              ephemeral: true
            })
          )
          .catch(_ => {
            interaction.editReply({
              content: "I couldn't message this member!",
              ephemeral: true
            })
          })
        break;

      default: throw new SyntaxError(`The arg '${cmd}' of let cmd is not handled`);
    }

  }
})