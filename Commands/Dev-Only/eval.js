/** @import { BoundFunction } from '#types/locals' */

const
  { codeBlock } = require('discord.js'),
  { minToMs } = require('#Utils').toMs,

  paramMap = { __dirname, __filename, exports, module, require },
  vars = [...Object.keys(paramMap), 'lang'],
  params = Object.values(paramMap),

  /** @type {BoundFunction<true>} */
  /* eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unsafe-assignment -- It get's used (and filled) later */
  BoundAsyncFunction = async function asyncEval() { }.constructor.bind(undefined, ...vars),

  /** @type {BoundFunction} */
  BoundFunction = Function.bind(undefined, ...vars),

  TIMEOUT_MS = minToMs(10);

/**
 * @param {number} ms
 * @returns {Promise<string>} */
const timeout = async ms => new Promise((_, rej) => void setTimeout(rej, ms, 'eval timed out.'));

/** @type {command<'prefix', false>} */
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

  async run(lang) {
    const msg = await this.reply(lang('global.loading', this.client.application.getEmoji('loading')));

    try {
      await Promise.race([
        (this.content.includes('await') ? new BoundAsyncFunction(this.content) : new BoundFunction(this.content)).call(this, ...params, lang),
        timeout(TIMEOUT_MS)
      ]);

      return await msg.customReply(lang('success', `${lang('finished', codeBlock('js', this.content))}\n`));
    }
    catch (rawErr) {
      const err = Error.isError(rawErr) ? rawErr : new Error(rawErr ?? lang('emptyRejection'));
      return void msg.customReply(lang('error', { msg: `${lang('finished', codeBlock('js', this.content))}\n`, name: err.name, err: err.message }));
    }
    finally { log.debug(`evaluated command '${this.content}'`); }
  }
};