const errorColor = require('chalk').bold.red;

function sendErrorMsg(errorName, client, msg) {
  if (!msg) msg =
    'A unexpected error occurred, please message the dev.\n' +
    `Error Type: \`${errorName || 'unknown'}\``;

  if (client.message) client.message.channel.send(msg);
  else if (client.interaction) client.interaction.channel.send(msg);
}

module.exports = client => {

  process
    .on('unhandledRejection', (err, origin) => {
      console.error(errorColor(' [Error Handling] :: Unhandled Rejection/Catch'));
      console.error(err, origin + '\n');

      if (err.name === 'DiscordAPIError')
        sendErrorMsg(null, client, 'An Discord API Error occurred, please try again and message the dev if this keeps happening.');
      else sendErrorMsg(err.name, client)
    })

    .on('uncaughtException', (err, origin) => {
      client.log(errorColor(' [Error Handling] :: Uncaught Exception/Catch'));
      console.error(err, origin + '\n');

      sendErrorMsg(err.name, client);
    })

    .on('uncaughtExceptionMonitor', (err, origin) => {
      console.error(errorColor(' [Error Handling] :: Uncaught Exception/Catch (MONITOR)'))
      console.error(err, origin + '\n');

      sendErrorMsg(err.name, client);
    });

  client
    .on('rateLimit', info => {
      const msg = `${info.route}: ${global?'Global':''} Rate Limit hit, please wait ${Math.round(info.timeout / 1000)}s before retrying.`
      console.error(errorColor(msg));
      console.error(info);
      console.error('\n');

      sendErrorMsg(info.name, client, msg);
    });

}