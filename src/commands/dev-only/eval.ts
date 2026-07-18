import { codeBlock } from 'discord.js';
import { AllContexts, Command, CommandType, OptionType } from '@mephisto5558/command';

import type { BoundFunction as BoundFunctionT } from '#types/locals';


const
  paramMap = { __dirname, __filename, module, require } as const,
  vars = [...Object.keys(paramMap), 'lang'] as const,
  params = Object.values(paramMap),

  /* eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unsafe-type-assertion -- It get's used and filled later */
  BoundAsyncFunction = (async function asyncEval(): Promise<void> { }.constructor as BoundFunctionT<true>).bind(undefined, ...vars),

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- It get's used and filled later */
  BoundFunction = (Function as unknown as BoundFunctionT).bind(undefined, ...vars),

  TIMEOUT_MS = Temporal.Duration.from({ minutes: 10 }).milliseconds,
  timeout = async (ms: number): Promise<string> => new Promise((_, rej) => void setTimeout(rej, ms, 'eval timed out.'));

export default new Command({
  types: [CommandType.Prefix],
  contexts: AllContexts,
  options: [{
    name: 'code',
    type: OptionType.String,
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
});