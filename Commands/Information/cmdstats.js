const { EmbedBuilder, Colors } = require('discord.js');

/** @type {command<'both', false>}*/
module.exports = {
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

      const total = Object.values(this.client.settings.stats[command.name]).reduce((acc, e) => acc + e, 0);

      embed.data.description = lang('embedDescriptionOne', {
        command: command?.id ? `</${command.name}:${command.id}>` : `\`${command.name}\``,
        total, prefix: 0, slash: 0, ...this.client.settings.stats[command.name]
      });
    }
    else {
      embed.data.description = lang('embedDescriptionMany');
      embed.data.fields = Object.entries(this.client.settings.stats)
        .filter(([k]) => !this.client.config.ownerOnlyFolders.includes((this.client.prefixCommands.get(k) ?? this.client.slashCommands.get(k))?.category))
        .map(([k, v]) => [k, { prefix: 0, slash: 0, ...v, total: Object.values(v).reduce((acc, e) => acc + e, 0) }])
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 10)
        .map(([k, v]) => {
          const id = this.client.application.commands.cache.find(e => e.name == k)?.id;
          return { name: id ? `</${k}:${id}>` : `/${k}`, value: lang('embedFieldValue', v), inline: true };
        });
    }

    return this.customReply({ embeds: [embed] });
  }
};