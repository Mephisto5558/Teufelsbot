const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");
const embedConfig = require('../../Settings/embed.json').colors;

module.exports = new Command({
  name: 'help',
  aliases: [],
  description: `Shows all bot commands`,
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: "Information",
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: "command",
    description: "Type a command here to search for it",
    type: "STRING",
    required: false
  }],

  run: (client, message, interaction) => {
    if (message) return client.functions.reply('Please use `/help`!', message, 10000);

    query = interaction.options?.getString('command');

    if (query) {
      const cmd = client.commands.get(query.toLowerCase());
      let embed = new MessageEmbed()
        .setColor(embedConfig.discord.BURPLE);

      if (!cmd) {
        embed
          .setDescription(`No Information found for command **${query.toLowerCase()}**`)
          .setColor(embedConfig.RED);
        return interaction.followUp({ embeds: [embed] });
      };

      if (cmd.name) {
        embed.setTitle(`Detailed Information about: \`${cmd.name}\``);
        embed.addField("**Command name**", `\`${cmd.name}\``);
      }

      if (cmd.aliases) embed.addField("Aliases:", `\`${cmd.aliases.join(', ')}\``);
      if (cmd.description) embed.addField("**Description**", `\`${cmd.description}\``);
      if (cmd.usage) {
        embed.addField("**Usage**", `\`${prefix}${cmd.usage}\``);
        embed.setFooter({ text: "Syntax: <> = required, [] = optional" });
      }

      return interaction.followUp({ embeds: [embed] });
    }

    let embed = new MessageEmbed()
      .setTitle(` 🔰All my commands`)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setColor(embedConfig.discord.BURPLE);

    const commands = category => {
      return client.commands
        .filter(cmd => cmd.category === category)
        .filter(cmd => !cmd.hideInHelp && cmd.category.toLowerCase() != 'owner-only')
        .map(cmd => `\`${cmd.name}\``);
    }

    for (let i = 0; i < client.categories.length; i += 1) {
      const current = client.categories[i];
      const items = commands(current);
      if (items.length === 0) continue;
      embed.addField(`**${current.toUpperCase()} [${items.length}]**`, `> ${items.join(", ")}\n`);
    }

    interaction.followUp({ embeds: [embed], ephemeral: true });
  }
})