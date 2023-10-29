const original_patch = require('discord.js').Message.prototype._patch;

/**Modified from default one.
 * @this Message @param {import('discord.js').APIMessage | import('discord.js').GatewayMessageUpdateDispatchData}data*/
module.exports = function _patch(data) {
  if ('content' in data) {
    this.originalContent = data.content ?? null;

    const prefixType = this.client.botType == 'dev' ? 'betaBotPrefix' : 'prefix';
    let
      prefixLength = 0,
      { prefix, caseinsensitive } = this.guild?.db.config?.[prefixType] ?? {};

    if (!prefix) prefix = this.client.defaultSettings.config[prefixType];
    if (caseinsensitive) prefix = prefix.toLowerCase();

    if ((caseinsensitive ? data.content.toLowerCase() : data.content).startsWith(prefix)) prefixLength = prefix.length;
    else if (data.content.startsWith(`<@${this.client.user.id}>`)) prefixLength = this.client.user.id.length + 3;

    this.args = data.content.replaceAll('<@!', '<@').slice(prefixLength).trim().split(' ');
    this.commandName = prefixLength ? this.args.shift().toLowerCase() : null;
  }
  else {
    this.originalContent ??= null;
    this.args ??= null;
    this.commandName ??= null;
  }

  original_patch.call(this, ...arguments);

  if (this.args) this.content = this.args.join(' ');
};