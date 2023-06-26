const AsyncFunction = (async function () { }).constructor;

module.exports = {
  name: 'eval',
  prefixCommand: true,
  slashCommand: false,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    if (!this.content) return;

    try {
      await (this.content.includes('await') ? new AsyncFunction('lang', this.content) : new Function('lang', this.content)).call(this, lang);
      await this.customReply(lang('success', lang('finished', this.content)));
    }
    catch (err) { this.customReply(lang('error', { msg: lang('finished', this.content), name: err.name, err: err.message })); }

    return log.debug(`evaluated command '${this.content}'`);
  }
};