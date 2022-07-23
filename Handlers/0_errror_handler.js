const { red } = require('chalk').bold;

function sendErrorMsg(errorName, {message, interaction}, msg) {
  if (!msg) msg =
    'A unexpected error occurred, please message the dev.\n' +
    `Error Type: \`${errorName || 'unknown'}\``;

  if (message) message.channel.send(msg);
  else if (interaction) interaction.channel.send(msg);
}

module.exports = client => {

  process
    .on('unhandledRejection', (err, origin) => {
      console.error(red(' [Error Handling] :: Unhandled Rejection/Catch'));
      console.error(err, origin + '\n');

      if (err.name === 'DiscordAPIError')
        sendErrorMsg(null, client, 'An Discord API Error occurred, please try again and message the dev if this keeps happening.');
      else sendErrorMsg(err.name, client)
    })

    .on('uncaughtException', (err, origin) => {
      client.log(red(' [Error Handling] :: Uncaught Exception/Catch'));
      console.error(err, origin + '\n');

      sendErrorMsg(err.name, client);
    })

    .on('uncaughtExceptionMonitor', (err, origin) => {
      console.error(red(' [Error Handling] :: Uncaught Exception/Catch (MONITOR)'))
      console.error(err, origin + '\n');

      sendErrorMsg(err.name, client);
    });

  client.rest.on('rateLimited', info => client.log(`Waiting for ${info.global ? 'global ratelimit' : `ratelimit on ${info.route}`} to subside (${info.timeToReset}ms)`));
}