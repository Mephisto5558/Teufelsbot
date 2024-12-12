const { hyperlink } = require('discord.js');

/** @type {command<'prefix'>} */
module.exports = {
  name: 'todo',
  slashCommand: false,
  prefixCommand: true,

  async run(lang) {
    return this.reply(
      hyperlink(lang('list'), `<${this.client.config.website.domain}/todo>`)
      /* eslint-disable-next-line sonarjs/no-incorrect-string-concat -- is correct */
      + hyperlink(lang('website'), `<${this.client.config.website.domain}/vote>`)
      + hyperlink(lang('discordNotes'), '<https://discord.com/channels/1011956895529041950/1183014623507656745>')
    );
  }
};