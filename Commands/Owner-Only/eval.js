module.exports = {
  name: 'eval',
  prefixCommand: true,
  slashCommand: false,
  dmPermission: true,
  beta: true,

  run: async function (lang, client) {
    if (!this.content) return;

    const msg = lang('finished', this.content);

    try {
      if (this.content.includes('await')) await eval(`with(this) { (async _ => { ${this.content} })() }`);
      else await eval(`with(this) { (_ => { ${this.content} })() }`);

      this.customReply(lang('success', msg));
    }
    catch (err) {
      this.customReply(lang('error', { msg, name: err.name, err: err.message }));
    }

    client.log(`evaluated command '${this.content}'`);
  }
};