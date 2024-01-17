/**@typedef {new (this: Message, __dirname: string, __filename: string, exports: NodeExports, module: NodeModule, require: NodeRequire, lang: lang) => Function}BoundFunction*/

const
  vars = ['__dirname', '__filename', 'exports', 'module', 'require', 'lang'], // these are the function params
  /**@type {BoundFunction}*/
  BoundAsyncFunction = (async function () { }).constructor.bind(null, ...vars),
  /**@type {BoundFunction}*/
  BoundFunction = Function.bind(null, ...vars);

/**@type {command}*/
module.exports = {
  name: 'eval',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  /**@this Message*/
  run: async function (lang) {
    if (!this.content) return;

    try {
      await (this.content.includes('await') ? new BoundAsyncFunction(this.content) : new BoundFunction(this.content)).call(this, __dirname, __filename, exports, module, require, lang);
      await this.customReply(lang('success', lang('finished', this.content)));
    }
    catch (err) { this.customReply(lang('error', { msg: lang('finished', this.content), name: err.name, err: err.message })); }

    return log.debug(`evaluated command '${this.content}'`);
  }
};