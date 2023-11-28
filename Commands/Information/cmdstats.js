const
  { EmbedBuilder, Colors } = require('discord.js'),
  ownerOnlyFolders = require('../../Utils').getOwnerOnlyFolders();

/**@type {command}*/
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
      command = this.options?.getString('command') || this.args?.[0],
      embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.White });

    if (command) {
      const id = this.client.application.commands.cache.find(e => e.name == command)?.id;
      embed.data.description = lang('embedDescriptionOne', { command: id ? `</${command}:${id}>` : `\`${command}\``, count: this.client.settings.stats?.[command] ?? 0 });
    }
    else {
      embed.data.description = lang('embedDescriptionMany');
      embed.data.fields = Object.entries(this.client.settings.stats || {})
        .filter(([e]) => !ownerOnlyFolders.includes((this.client.prefixCommands.get(e) || this.client.slashCommands.get(e))?.category.toLowerCase()))
        .sort(([, a], [, b]) => b - a).slice(0, 10).map(([k, v]) => {
          const id = this.client.application.commands.cache.find(e => e.name == k)?.id;
          return { name: id ? `</${k}:${id}>` : `/${k}`, value: `**${v}**`, inline: true };
        });
    }

    return this.customReply({ embeds: [embed] });
  }
};