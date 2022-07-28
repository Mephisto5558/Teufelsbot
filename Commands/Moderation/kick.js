const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js');

module.exports = new Command({
  name: 'kick',
  aliases: { prefix: [], slash: [] },
  description: 'kicks a member from the server',
  usage: '',
  permissions: { client: ['EmbedLinks', 'KickMembers'], user: ['KickMembers'] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'targets',
      description: 'Mention member(s) or put ID(s) in to kick them. Put a space between each target',
      type: 'String',
      required: true
    },
    {
      name: 'reason',
      description: 'The target(s) will see the reason in DMs.',
      type: 'String',
      required: true
    }
  ],

  run: async (_, interaction) => {
    const
      targets = new Set([...interaction.options.getString('targets').replace(/[^0-9\s]/g, '').split(' ').filter(e => e?.length == 18)]),
      reason = interaction.options.getString('reason'),
      embed = new EmbedBuilder({
        title: 'Kicked',
        description:
          `You have been kicked from \`${interaction.guild.name}\`.\n` +
          `Moderator: ${interaction.user.tag}\n` +
          `Reason: ${reason}`,
        color: Colors.Red
      }),
      resEmbed = new EmbedBuilder({
        title: 'Kick',
        description:
          `Moderator: ${interaction.user.tag}\n` +
          `Reason: ${reason}\n\n`,
        color: Colors.Red
      });

    for (const rawTarget of targets) {
      let target, errorMsg, noMsg;

      try { target = await interaction.guild.members.fetch(rawTarget) }
      catch { target = { id: rawTarget } }

      if (!target.id) errorMsg = `I couldn't find that member!`;
      else if (target.id == interaction.member.id) errorMsg = `You can't kick yourself!`;
      else if (target.roles.highest.comparePositionTo(interaction.member.roles.highest) > -1 && interaction.guild.ownerId != interaction.user.id)
        errorMsg = `You don't have the permission to do that!`;
      else if (!target.kickable) errorMsg = `I don't have the permission to do that!`;

      if (errorMsg) {
        resEmbed.data.description += `**${target?.user?.tag ?? target.id}** couldn't been kicked.\n${errorMsg}\n`;
        continue;
      }

      try { await target.send({ embeds: [embed] }) }
      catch { noMsg = true }

      await target.kick(reason);

      resEmbed.data.description +=
        `**${target?.user?.tag ?? target.id}** has been successfully kicked.\n` +
        `${noMsg ? `\nI couldn't DM the target.` : ''}`;
    }
    interaction.editReply({ embeds: [resEmbed] });

  }
})
