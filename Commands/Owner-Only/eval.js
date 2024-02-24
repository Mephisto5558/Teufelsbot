/* eslint-disable-next-line jsdoc/valid-types */ // jsdoc doesn't like me using "module" as a param name
/** @typedef {new (this: Message, __dirname: string, __filename: string, module: NodeJS.Module, exports: NodeJS.Module['exports'], require: NodeJS.Require, lang: lang) => Function}BoundFunction*/

const
  vars = ['__dirname', '__filename', 'exports', 'module', 'require', 'lang'], // these are the function params

  /** @type {BoundFunction}*/
  /* eslint-disable-next-line no-empty-function, func-names */
  BoundAsyncFunction = async function () { }.constructor.bind(undefined, ...vars),

  /** @type {BoundFunction}*/
  /* eslint-disable-next-line no-new-func */
  BoundFunction = Function.bind(undefined, ...vars);

/** @type {command<'prefix', false>}*/
module.exports = {
  name: 'eval',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: async function (lang) {
    if (!this.content) return;

    const msg = await this.reply(lang('global.loading'));

    try {
      await (this.content.includes('await') ? new BoundAsyncFunction(this.content) : new BoundFunction(this.content)).call(this, __dirname, __filename, module, exports, require, lang);
      await msg.customReply(lang('success', lang('finished', this.content)));
    }
    catch (err) { msg.customReply(lang('error', { msg: lang('finished', this.content), name: err.name, err: err.message })); }

    return log.debug(`evaluated command '${this.content}'`);
  }
};