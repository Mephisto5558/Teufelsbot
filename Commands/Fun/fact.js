const
  { EmbedBuilder } = require('discord.js'),
  fetch = require('node-fetch').default;

module.exports = {
  name: 'fact',
  cooldowns: { guild: 100 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  
  run: async function (lang) {
    const
      data = await fetch(`https://uselessfacts.jsph.pl/api/v2/facts/random?language=${lang.__boundArgs__[0].locale}`).then(e => e.json()),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: `${data.text}\n\nSource: [${data.source}](${data.source_url})`,
        footer: { text: '- https://uselessfacts.jsph.pl' }
      }).setColor('Random');

    return this.customReply({ embeds: [embed] });
  }
};