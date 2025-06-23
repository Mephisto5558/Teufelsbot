const
  { bold, channelMention, userMention } = require('discord.js'),
  { constants: { embedFieldMaxAmt }, convertToMedal } = require('#Utils');

/** @type {import('.')['getTopChannels']} **/
module.exports.getTopChannels = function getTopChannels(_lang, guild, amt = embedFieldMaxAmt) {
  return Object.entries(guild.db.wordCounter.channels)
    .toSorted(([, a], [, b]) => b - a)
    .slice(0, amt)
    .map(([k, v], i) => ({ name: `${i + 1}. ${channelMention(k)}`, value: bold(v), inline: false }));
};

/** @type {import('.')['getTopMembers']} **/
module.exports.getTopMembers = function getTopMembers(_lang, guild, amt = embedFieldMaxAmt) {
  return Object.entries(guild.db.wordCounter.members)
    .filter(([k]) => guild.members.cache.has(k))
    .toSorted(([, a], [, b]) => b.sum - a.sum)
    .slice(0, amt)
    .map(([k, { sum: v }], i) => ({ name: `${convertToMedal(i)} ${userMention(k)}`, value: bold(v), inline: false }));
};

/** @type {import('.')['getTopChannelMembers']} **/
module.exports.getTopChannelMembers = function getTopChannelMembers(_lang, guild, channelId, amt = embedFieldMaxAmt) {
  return Object.entries(guild.db.wordCounter.members)
    .map(([k, v]) => [k, v.channels[channelId]])
    .filter(([k]) => guild.members.cache.has(k))
    .toSorted(([, a], [, b]) => b - a)
    .slice(0, amt)
    .map(([k, v], i) => ({ name: `${convertToMedal(i)} ${userMention(k)}`, value: bold(v), inline: false }));
};