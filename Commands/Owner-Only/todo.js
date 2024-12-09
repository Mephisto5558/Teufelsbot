/** @type {command<'prefix'>} */
module.exports = {
  name: 'todo',
  slashCommand: false,
  prefixCommand: true,

  async run() {
    return this.reply( // Todo: use `lang`
      `[ToDo excel](<${this.client.config.website.domain}/todo>), `
      + `[Voting page](<${this.client.config.website.domain}/vote>), `
      + '[Notes in the support server](<https://discord.com/channels/1011956895529041950/1183014623507656745>)'
    );
  }
};