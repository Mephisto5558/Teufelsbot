const
  { codeBlock } = require('discord.js'),
  { shellExec } = require('#Utils');

/** @type {command<'prefix', false>} */
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'command',
    type: 'String',
    required: true
  }],
  beta: true,

  async run(lang) {
    const msg = await this.reply(lang('global.loading', this.client.application.getEmoji('loading')));

    try {
      const { stdout, stderr } = await shellExec(this.content);
      let response = lang('stdout', {
        msg: `${lang('finished', codeBlock('sh', this.content))}\n`,
        stdout: codeBlock(stdout.trim() || lang('global.none'))
      });
      if (stderr.trim()) response += `\n${lang('stderr', codeBlock(stderr.trim()))}`;

      await msg.customReply(response);
    }
    catch (rawErr) {
      const err = rawErr instanceof Error ? rawErr : new Error(rawErr);
      return msg.customReply(lang('error', { msg: `${lang('finished', codeBlock('sh', this.content))}\n`, name: err.name, err: err.message }));
    }

    return log.debug(`executed bash command '${this.content}'`);
  }
};