/* eslint-disable @typescript-eslint/no-magic-numbers -- these are constants */
module.exports = Object.freeze({
  pinnedMessagesMaxAmt: 250, // per channel
  embedTitleMaxLength: 256,
  embedDescriptionMaxLength: 4096,
  embedFieldMaxAmt: 25,
  embedFieldValueMaxLength: 1024,
  messageMaxLength: 2000,
  memberNameMinLength: 1,
  memberNameMaxLength: 32,
  choiceNameMinLength: 1,
  choiceNameMaxLength: 100,
  buttonLabelMaxLength: 80,
  buttonURLMaxLength: 512,
  messageActionRowMaxAmt: 5,
  actionRowButtonMaxAmt: 5,
  auditLogReasonMaxLength: 400, // 512, "by Mod xyz, command xy"
  maxBanMessageDeleteDays: 7,
  emojiNameMinLength: 2,
  emojiNameMaxLength: 32,
  snowflakeMinLength: 17,
  snowflakeMaxLength: 19, // No snowflake will be longer than that until 2090 (https://snowsta.mp/?s=9999999999999999999).
  bulkDeleteMaxMessageAmt: 100,
  HTTP_STATUS_CLOUDFLARE_BLOCKED: 522, // // https://community.cloudflare.com/t/community-tip-fixing-error-522-connection-timed-out/42325
  JSON_SPACES: 2,
  maxPercentage: 100,
  suffix: '...',

  /**
   * @param {Client<boolean>} client
   * @param {boolean} hasBody */
  commonHeaders: (client, hasBody = false) => Object.freeze({
    'User-Agent': `Discord Bot ${client.application?.name ?? client.user?.displayName ?? ''}`
      + (client.config.github.repo ? ` (${client.config.github.repo})` : ''),
    Accept: 'application/json',
    ...hasBody ? { 'Content-Type': 'application/json' } : undefined
  })
});