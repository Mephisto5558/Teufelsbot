const
  { EmbedBuilder } = require('discord.js'),
  { commandMention } = require('#Utils'),
  { getChannelTop } = require('./_utils');

/** @type {import('.')} */
module.exports = {
  options: [{
    name: 'guild',
    type: 'Number',
    autocompleteOptions: function () {
      return this.client.guilds.cache
        .filter(e => e.members.cache.has(this.user.id))
        .map(e => ({ name: e.name, value: e.id }));
    },
    strictAutocomplete: true
  }],

  async run(lang) {
    const guild = this.client.guilds.cache.get(this.options.getString('guild') ?? this.guild?.id);
    if (!guild) return this.customReply(lang('invalidGuild'));
    if (!guild.db.wordCounter?.enabled) {
      const command = this.client.slashCommands.get('setup');
      return this.customReply(lang('notEnabled', commandMention(`${command.name} ${this.command.name}`, command.id)));
    }

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription'),
      fields: [
        { name: lang('total'), value: this.guild.db.wordCounter.sum },
        {
          name: lang('topChannels'),
          value: getChannelTop.call(this, lang, guild),
          inline: false
        }
      ]
    });


    return this.customReply({ embeds: [embed] });
  }
};