const
  vars = ['__dirname', '__filename', 'exports', 'module', 'require', 'lang'], // these are the function params

  /** @type {import('../../globals').__local.BoundFunction}*/
  /* eslint-disable-next-line no-empty-function */
  BoundAsyncFunction = async function asyncEval() { }.constructor.bind(undefined, ...vars),

  /** @type {import('../../globals').__local.BoundFunction}*/
  /* eslint-disable-next-line no-new-func */
  BoundFunction = Function.bind(undefined, ...vars);

/** @type {command<'prefix', false>}*/
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'code',
    type: 'String',
    required: true
  }],
  beta: true,

  run: async function (lang) {
    const msg = await this.reply(lang('global.loading'));

    try {
      await (this.content.includes('await') ? new BoundAsyncFunction(this.content) : new BoundFunction(this.content)).call(this, __dirname, __filename, module, exports, require, lang);
      await msg.customReply(lang('success', lang('finished', this.content)));
    }
    catch (err) { msg.customReply(lang('error', { msg: lang('finished', this.content), name: err.name, err: err.message })); }

    return log.debug(`evaluated command '${this.content}'`);
  }
};