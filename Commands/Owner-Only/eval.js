module.exports = {
  name: 'eval',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  prefixCommand: true,
  slashCommand: false,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    if (!this.content) return;

    const msg = lang('finished', this.content);

    Promise.resolve(eval(`(async () => { ${this.content} })()`))
      .then(() => this.customReply(lang('success', msg)))
      .catch(err => this.customReply(lang('error', { msg, name: err.name, err: err.message })));

    this.client.log(`evaluated command '${this.content}'`);
  }
};