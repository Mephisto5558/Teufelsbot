const original_patch = require('discord.js').Message.prototype._patch;

/**Modified from default one.
 * @param {import('discord.js').APIMessage | import('discord.js').GatewayMessageUpdateDispatchData}data*/
module.exports = function _patch(data) {
  if ('content' in data) {
    /**
     * The original content of the message. This is a custom property set in "prototypeRegisterer.js".
     * <info>This property requires the GatewayIntentBits.MessageContent privileged intent
     * in a guild for messages that do not mention the client.</info>
     * @type {?string}
     */
    this.originalContent = data.content;

    const prefixType = this.client.botType == 'dev' ? 'betaBotPrefix' : 'prefix';
    let
      prefixLength = 0,
      { prefix, caseinsensitive } = this.guild?.db.config?.[prefixType] ?? {};

    if (!prefix) prefix = this.client.defaultSettings.config[prefixType];
    if (caseinsensitive) prefix = prefix.toLowerCase();

    if ((caseinsensitive ? data.content.toLowerCase() : data.content).startsWith(prefix)) prefixLength = prefix.length;
    else if (data.content.startsWith(`<@${this.client.user.id}>`)) prefixLength = this.client.user.id.length + 3;

    /**
     * The arguments of the message. It slices out the prefix and splits by spaces. This is a custom property set in "prototypeRegisterer.js".
     * @type {?string[]}
     */
    this.args = data.content.replaceAll('<@!', '<@').slice(prefixLength).trim().split(' ');

    /**
     * The first word of the original message content. `null` if no prefix has been found. This is a custom property set in "prototypeRegisterer.js".
     * @type {?string}
     */
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