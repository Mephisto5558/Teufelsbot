const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");
const embedConfig = require('../../Settings/embed.json').colors;

function listCommands(list, output, count, category) {
  for (let command of list) {
    let cmd = command;
    if(category) {
      cmd = command[1];
      if (cmd.category.toUpperCase() != category || cmd.hideInHelp || cmd.disabled) continue;
    }

    if (count % 5 == 0) output += `\`${cmd.name}\`\n> `
    else output += `\`${cmd.name}\`, `
    count++
  }
  return [output, count];
}

module.exports = new Command({
  name: 'help',
  aliases: [],
  description: `Shows all bot commands`,
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: "Information",
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [{
    name: "command",
    description: "Type a command here to search for it",
    type: "STRING",
    required: false
  }],

  run: (client, message, interaction) => {
    if (message) return client.functions.reply('Please use `/help`!', message, 10000);

    let query = interaction.options?.getString('command')?.toLowerCase();
    let embed = new MessageEmbed()
      .setColor(embedConfig.discord.BURPLE);

    if (query) {
      const cmd = client.commands.get(query);

      if (!cmd?.name || cmd.hideInHelp || cmd.disabled || cmd.category.toLowerCase() == 'owner-only') {
        embed
          .setDescription(`No Information found for command \`${query}\``)
          .setColor(embedConfig.RED);
      }
      else {
        if (cmd.name) embed.setTitle(`Detailed Information about: \`${cmd.name}\``);
        if (cmd.description) embed.setDescription(cmd.description);
        if (cmd.aliases.length) embed.addField('Aliases', `\`${listCommands(cmd.aliases, '', 1).replace(/> /g, '')}\``);
        if (cmd.slashCommand) cmd.usage += '\nSLASH Command: look at the option descriptions';
        if (cmd.usage) embed
          .addField('Usage', `\`${client.guildData.get(message.guild?.id)?.prefix || client.guildData.get('default')?.prefix}${cmd.usage}\``)
          .setFooter({ text: "Syntax: <> = required, [] = optional" });
      }

      return interaction.editReply({ embeds: [embed] });
    }

    embed
      .setTitle(`🔰All my commands`)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));

    for (i = 0; i < client.categories.length; i++) {
      const category = client.categories[i].toUpperCase();
      if (category == 'OWNER-ONLY') continue;

      let data = listCommands(client.commands, '', 1, category);
      data = listCommands(client.slashCommands, data[0], data[1], category);
      cmdList = data[0];

      if (data[1] == 1) continue;

      if (cmdList.endsWith(', ')) cmdList = cmdList.slice(0, -2);
      if (cmdList) embed.addField(`**${category} [${data[1] - 1}]**`, `> ${cmdList}\n`);
    }

    if (!embed.fields) embed.setDescription('No commands found...');
    else embed.setFooter({ text: `Use the 'command' option to get more information about a specific command.` })

    interaction.editReply({ embeds: [embed] });
  }
})