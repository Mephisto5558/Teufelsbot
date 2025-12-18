const
  { createHash } = require('node:crypto'),
  { getTargetMembers, constants: { maxPercentage } } = require('#Utils'),

  hashPartLength = 5,
  botIds = new Set(['964315306015211560', '948978571802710047']),
  botDevShip = 80,
  /** @type {[Snowflake, Snowflake, number][]} */ customShips = [];

/**
 * @this {Message}
 * @param {Snowflake} target1
 * @param {Snowflake} target2 */
function getCustomShipPercentage(target1, target2) {
  if ((this.client.config.devIds.has(target1) || this.client.config.devIds.has(target2)) && (botIds.has(target1) || botIds.has(target2)))
    return botDevShip;

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
    return this.customReply(`${user1.displayName} :heart: ${user2.displayName}: ${calculatePercentage.call(this, user1.id, user2.id)}%`);
  }
};