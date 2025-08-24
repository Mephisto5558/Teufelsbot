const
  { createHash } = require('node:crypto'),
  { getTargetMembers } = require('#Utils'),
  maxPercentage = 100,
  hashPartLength = 5,

  /** @type {[Snowflake, Snowflake, number][]} */
  customShips = [
    /* eslint-disable @typescript-eslint/no-magic-numbers */
    ['691550551825055775', '948978571802710047', 80],
    ['691550551825055775', '964315306015211560', 80]
    /* eslint-enable @typescript-eslint/no-magic-numbers */
  ];

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

    if (!user1 || !user2) return this.customReply(lang('global.unknownUser'));
    return this.customReply(`${user1.customName} :heart: ${user2.customName}: ${calculatePercentage(user1, user2)}%`);
  }
};

/**
 * @param {Snowflake} user1Id
 * @param {Snowflake} user2Id */
function calculatePercentage(user1Id, user2Id) {
  const customShip = customShips.find(e => e[0] == user1Id && e[1] == user2Id || e[0] == user2Id && e[1] == user1Id);
  if (customShip) return customShip[2];

  const combinedHash = createHash('sha256').update(
    createHash('sha256').update(String(BigInt(user1Id) + BigInt(user2Id))).digest('hex')
  ).digest('hex');

  return Number.parseInt(combinedHash.slice(0, hashPartLength), 16) % (maxPercentage + 1);
}