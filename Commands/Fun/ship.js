const
  { Team } = require('discord.js'),
  { createHash } = require('node:crypto'),
  { getTargetMembers } = require('#Utils'),

  maxPercentage = 100,
  hashPartLength = 5,
  botIds = ['964315306015211560', '948978571802710047'],
  botDevShip = 80,
  /** @type {[Snowflake, Snowflake, number][]} */ customShips = [];

/**
 * @this {Message}
 * @param {Snowflake} target1
 * @param {Snowflake} target2 */
function getCustomShipPercentage(target1, target2) {
  const { owner } = this.client.application;
  if (owner && botIds.some(e => e == target1 || e == target2)) {
    const devIds = owner instanceof Team ? [...owner.members.keys()] : [owner.id];
    if (devIds.some(e => e == target1 || e == target2)) return botDevShip;
  }

  /* eslint-disable-next-line sonarjs/no-empty-collection -- may be filled in the future */
  return customShips.find(e => e.includes(target1) && e.includes(target2))?.[2];
}


/**
 * @this {Message}
 * @param {Snowflake} user1Id
 * @param {Snowflake} user2Id */
function calculatePercentage(user1Id, user2Id) {
  const customShip = getCustomShipPercentage.call(this, user1Id, user2Id);
  if (customShip) return customShip;

  const combinedHash = createHash('sha256').update(
    createHash('sha256').update(String(BigInt(user1Id) + BigInt(user2Id))).digest('hex')
  ).digest('hex');

  return Number.parseInt(combinedHash.slice(0, hashPartLength), 16) % (maxPercentage + 1);
}

/** @type {command<'both'>} */
module.exports = {
  slashCommand: true,
  prefixCommand: true,
  options: [
    {
      name: 'user1',
      type: 'User',
      required: true
    },
    { name: 'user2', type: 'User' }
  ],

  async run(lang) {
    const [user1, user2] = getTargetMembers(this, [{ targetOptionName: 'user1' }, { targetOptionName: 'user2', returnSelf: true }]);

    if (!user1) return this.customReply(lang('global.unknownUser'));
    return this.customReply(`${user1.displayName} :heart: ${user2.displayName}: ${calculatePercentage.call(this, user1, user2)}%`);
  }
};