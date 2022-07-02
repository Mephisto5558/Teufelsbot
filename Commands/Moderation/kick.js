const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  { colors } = require('../../Settings/embed.json');

module.exports = new Command({
  name: 'kick',
  aliases: [],
  description: 'kicks a member from the server',
  usage: '',
  permissions: { client: ['KICK_MEMBERS'], user: ['KICK_MEMBERS'] },
  cooldowns: { global: '', user: '' },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'targets',
      description: 'Mention member(s) or put ID(s) in to kick them. Put a space between each target',
      type: 'STRING',
      required: true
    },
    {
      name: 'reason',
      description: 'The target(s) will see the reason in DMs.',
      type: 'STRING',
      required: true
    }
  ],

  run: async (_, __, interaction) => {
    const
      targets = new Set([...interaction.options.getString('targets').replace(/[^0-9\s]/g, '').split(' ').filter(e => e?.length == 18)]),
      reason = interaction.options.getString('reason'),
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
      } catch { };

      if (!target.id) errorMsg = `I couldn't find that member!`;
      else if (target.id == interaction.member.id) errorMsg = `You can't kick yourself!`;
      else if (target.roles.highest.comparePositionTo(interaction.member.roles.highest) > -1 && interaction.guild.ownerId != interaction.user.id)
        errorMsg = `You don't have the permission to do that!`;
      else if (!target.kickable) errorMsg = `I don't have the permission to do that!`;

      if (errorMsg) {
        resEmbed.description += `**${target?.user?.tag ?? target.id}** couldn't been banned.\n${errorMsg}\n`;
        continue;
      }

      try { await target.send({ embeds: [embed] }) }
      catch { noMsg = true }

      await target.kick(reason);

      resEmbed.description +=
        `**${target?.user?.tag ?? target.id}** has been successfully banned.\n` +
        `${noMsg ? `\nI couldn't DM the target.` : ''}`;
    }
    interaction.editReply({ embeds: [embed] });

  }
})