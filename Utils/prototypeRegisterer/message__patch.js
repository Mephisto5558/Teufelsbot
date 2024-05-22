/* eslint-disable unicorn/no-null -- Mimicing discord.js behavior */
const originalPatch = require('discord.js').Message.prototype._patch;

/**
 * Modified from default one.
 * @type {import('discord.js').Message['_patch']}
 * @this {Message}
 **/
module.exports = function _patch(data, ...rest) {
  if ('content' in data) {
    this.originalContent = data.content ?? null;

    const prefixType = this.client.botType == 'dev' ? 'betaBotPrefix' : 'prefix';
    let
      prefixLength = 0,
      { prefix, caseinsensitive } = this.guild?.db.config[prefixType] ?? {};

    prefix ||= this.client.defaultSettings.config[prefixType];
    if (caseinsensitive) prefix = prefix.toLowerCase();

    if ((caseinsensitive ? data.content.toLowerCase() : data.content).startsWith(prefix)) prefixLength = prefix.length;
    else if (data.content.startsWith(`<@${this.client.user.id}>`)) prefixLength = this.client.user.id.length + 3;

    if (data.content.includes('<@!')) log('Found <@! in message!'); // Temporary to see if the replaceAll is still needed
    this.args = data.content.replaceAll('<@!', '<@').slice(prefixLength).trim()
      .split(' ');
    this.commandName = prefixLength ? this.args.shift().toLowerCase() : null;
  }
  else {
    this.originalContent ??= null;
    this.args ??= null;
    this.commandName ??= null;
  }

  originalPatch.call(this, data, ...rest);

  if (this.args) this.content = this.args.join(' ');
};