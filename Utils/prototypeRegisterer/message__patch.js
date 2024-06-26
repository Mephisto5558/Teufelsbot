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

    const prefixType = this.client.botType == 'dev' ? 'betaBotPrefixes' : 'prefixes';
    let
      prefixLength = 0,

      /** @type {Database<true>['guildSettings']['']['config']['prefixes']|Database<true>['guildSettings']['']['config']['betaBotPrefixes']}*/
      prefixes = this.guild?.db.config[prefixType];

    if (!prefixes?.[0].prefix) prefixes = this.client.defaultSettings.config[prefixType];

    for (const { prefix, caseinsensitive } of prefixes) {
      if (
        (caseinsensitive ? data.content.toLowerCase() : data.content).startsWith(caseinsensitive ? prefix.toLowerCase() : prefix)
        || data.content.startsWith(`<@${this.client.user.id}>`)
      ) {
        prefixLength = data.content.startsWith(`<@${this.client.user.id}>`) ? this.client.user.id.length + 3 : prefix.length;
        break;
      }
    }

    this.args = data.content.slice(prefixLength).trim().split(/\s+/g);
    this.commandName = prefixLength ? this.args.shift().toLowerCase() : null;
  }
  else {
    this.originalContent ??= null;
    this.args ??= null;
    this.commandName ??= null;
  }

  originalPatch.call(this, data, ...rest);

  if (this.args) this.content = this.args.join(' ').trim();
};