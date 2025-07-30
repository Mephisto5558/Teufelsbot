const
  { bold, Guild, GuildChannel } = require('discord.js'),
  { constants: { embedFieldMaxAmt }, convertToMedal } = require('#Utils');

/**
 * @typedef {[Guild | GuildChannel | import('discord.js').GuildMember | undefined, number | undefined]} MapFnRet
 * @param {Record<string, unknown>} data
 * @param {number} sliceAmt
 * @param {(data: [string | undefined, number | undefined]) => MapFnRet} mapFn */
const format = (data, sliceAmt, mapFn) => Object.entries(data)
  .map(mapFn)
  .filter(([k, v]) => k && v)
  .toSorted(([, a], [, b]) => b - a)
  .slice(0, sliceAmt)
  .map(([k, v], i) => ({
    name: `${convertToMedal(i)} ${k instanceof Guild || k instanceof GuildChannel ? k.name : k.displayName}`,
    value: bold(v), inline: false
  }));

/** @type {import('.')['getTopGuilds']} */
module.exports.getTopGuilds = (user, amt = embedFieldMaxAmt) => format(
  user.db.wordCounter.guilds, amt,
  ([k, v]) => [user.client.guilds.cache.get(k), v.sum]
);

/** @type {import('.')['getTopChannels']} */
module.exports.getTopChannels = (guild, amt = embedFieldMaxAmt) => format(
  guild.db.wordCounter.channels, amt,
  ([k, v]) => [guild.channels.cache.get(k), v]
);

/** @type {import('.')['getTopMembers']} */
module.exports.getTopMembers = (guild, amt = embedFieldMaxAmt) => format(
  guild.db.wordCounter.members, amt,
  ([k, v]) => [guild.members.cache.get(k), v.sum]
);

/** @type {import('.')['getTopChannelMembers']} */
module.exports.getTopChannelMembers = (guild, channelId, amt = embedFieldMaxAmt) => format(
  guild.db.wordCounter.members, amt,
  ([k, v]) => [guild.members.cache.get(k), v.channels[channelId]]
);