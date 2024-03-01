const
  { EmbedBuilder, Colors } = require('discord.js'),
  ownerOnlyFolders = require('../../Utils').getOwnerOnlyFolders();

/** @type {command<'both', false>}*/
module.exports = {
  name: 'cmdstats',
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'command',
    type: 'String',
    autocompleteOptions: function () { return [...new Set([...this.client.prefixCommands.keys(), ...this.client.slashCommands.keys()])]; },
    strictAutocomplete: true
  }],

  run: function (lang) {
    const
      query = (this.options?.getString('command') ?? this.args?.[0])?.toLowerCase(),
      embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.White });

    if (query) {
      let command = this.client.slashCommands.get(query) ?? this.client.prefixCommands.get(query);
      if (command?.aliasOf) command = this.client.slashCommands.get(command.aliasOf) || this.client.prefixCommands.get(command.aliasOf);

      embed.data.description = lang('embedDescriptionOne', {
        command: command?.id ? `</${command.name}:${command.id}>` : `\`${command.name}\``, count: this.client.settings.stats?.[command.name] ?? 0
      });
    }
    else {
      embed.data.description = lang('embedDescriptionMany');
      embed.data.fields = Object.entries(this.client.settings.stats ?? {})
        .filter(([e]) => !ownerOnlyFolders.includes((this.client.prefixCommands.get(e) ?? this.client.slashCommands.get(e))?.category.toLowerCase()))
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([k, v]) => {
          const id = this.client.application.commands.cache.find(e => e.name == k)?.id;
          return { name: id ? `</${k}:${id}>` : `/${k}`, value: `**${v}**`, inline: true };
        });
    }

    return this.customReply({ embeds: [embed] });
  }
};