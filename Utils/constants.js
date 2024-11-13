/* eslint-disable custom/sonar-no-magic-numbers -- these are constants*/
module.exports = {
  autocompleteOptionsMaxAmt: 25,
  embedTitleMaxLength: 256,
  embedDescriptionMaxLength: 4096,
  embedFieldMaxAmt: 25,
  embedFieldValueMaxLength: 1024,
  messageMaxLength: 2000,
  memberNameMinLength: 1,
  memberNameMaxLength: 32,
  choicesMaxAmt: 25,
  choiceNameMinLength: 1,
  choiceNameMaxLength: 100,
  choiceValueMaxLength: 100,
  buttonLabelMaxLength: 80,
  auditLogReasonMaxLength: 400, // 512, "by Mod xyz, command xy"
  maxBanMessageDeleteDays: 7,
  snowflakeMinLength: 17,
  snowflakeMaxLength: 19, // No snowflake will be longer than that until 2090 (https://snowsta.mp/?s=9999999999999999999)
  HTTP_STATUS_CLOUDFLARE_BLOCKED: 522, // // https://community.cloudflare.com/t/community-tip-fixing-error-522-connection-timed-out/42325
  suffix: '...'
};