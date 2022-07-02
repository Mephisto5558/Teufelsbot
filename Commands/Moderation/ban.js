const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  { colors } = require('../../Settings/embed.json');

module.exports = new Command({
  name: 'ban',
  aliases: [],
  description: 'bans a member from the guild',
  usage: '',
  permissions: { client: ['BAN_MEMBERS'], user: ['BAN_MEMBERS'] },
  cooldowns: { global: '', user: '' },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'targets',
      description: 'Mention member(s) or put ID(s) in to ban them. Put a space between each target',
      type: 'STRING',
      required: true
    },
    {
      name: 'reason',
      description: 'The target(s) will see the reason in DMs.',
      type: 'STRING',
      required: true
    },
    {
      name: 'delete_days_of_messages',
      description: 'Delete all messages of the targets of the last n days. max. 7d',
      type: 'NUMBER',
      min_value: 1,
      max_value: 7,
      required: false
    }
    /*{
      name: 'duration',
      description: 'How long want you to get the target banned, empty for permament',
      type: "NUMBER",
      required: false,
      disabled: true
    }*/
  ],

  run: async (_, __, interaction) => {
    const
      targets = new Set([...interaction.options.getString('targets').replace(/[^0-9\s]/g, '').split(' ').filter(e => e?.length == 18)]),
      reason = interaction.options.getString('reason'),
      days = interaction.options.getNumber('delete_days_of_messages'),
      embed = new MessageEmbed({
        title: 'Banned',
        description:
          `You have been banned from \`${interaction.guild.name}\`.\n` +
          `Moderator: ${interaction.user.tag}\n` +
          `Reason: ${reason}`,
        color: colors.RED
      }),
      resEmbed = new MessageEmbed({
        title: 'Ban',
        description:
          `Moderator: ${interaction.user.tag}\n` +
          `Reason: ${reason}\n\n`,
        color: colors.RED
      });

    for (const rawTarget of targets) {
      let target, errorMsg, noMsg;

      try {
        target = await interaction.guild.members.fetch(rawTarget);
      } catch { target = { id: rawTarget } };

      if (target.id == interaction.member.id) errorMsg = `You can't ban yourself!`;
      else if (target.roles && target.roles.highest.comparePositionTo(interaction.member.roles.highest) > -1 && interaction.guild.ownerId != interaction.user.id)
        errorMsg = `You don't have the permission to do that!`;
      else if (target.bannable === false) errorMsg = `I don't have the permission to do that!`;

      if (errorMsg) {
        resEmbed.description += `**${target?.user?.tag ?? target.id}** couldn't been banned.\n${errorMsg}\n`;
        continue;
      }

      try {
        if (!target.send) noMsg = true;
        else await target.send({ embeds: [embed] })
      }
      catch { noMsg = true }

      await interaction.guild.bans.create(target.id, {
        reason: reason,
        days: days > 7 ? 7 : days < 1 ? 1 : days
      });

      resEmbed.description +=
        `**${target?.user?.tag ?? target.id}** has been successfully banned.\n` +
        `${noMsg ? `\nI couldn't DM the target.` : ''}`;
    }

    interaction.editReply({ embeds: [resEmbed] });
  }
})