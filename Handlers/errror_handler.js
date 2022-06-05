const chalk = require("chalk");
const errorColor = chalk.bold.red;

module.exports = client => {

  function sendErrorMsg(msg) {
    if(client.message) {
      client.functions.reply(msg, client.message)
    } else if(client.interaction) {
      client.interaction.channel.send(msg)
    }
  }
  
  process
    .on('unhandledRejection', (err, origin) => {
      console.error(errorColor(' [Error Handling] :: Unhandled Rejection/Catch'));
      console.error(err, origin);
      console.error(`\n`)

      if(err.name === 'DiscordAPIError') sendErrorMsg("A Discord API Error occurred, please try again and ping the dev if this keeps happening.")
      else sendErrorMsg(`A unknown error occurred, please ping the dev.\nError Type: \`${err.name  || 'unknown'}\``);
    })

  .on('uncaughtException', (err, origin) => {
    client.log(errorColor(' [Error Handling] :: Uncaught Exception/Catch'));
    client.log(err, origin);
    client.log(`\n`);

    sendErrorMsg(`A unknown error occurred, please ping the dev.\nError Type: \`${err.name  || 'unknown'}\``);
  })

  .on('uncaughtExceptionMonitor', (err, origin) => {
    console.error(errorColor(' [Error Handling] :: Uncaught Exception/Catch (MONITOR)'))
    console.error(err, origin);
    console.error(`\n`);

    sendErrorMsg(`A unknown error occurred, please ping the dev.\nError Type: \`${err.name  || 'unknown'}\``);
  });

  client
    .on('rateLimit', info => {
      const msg = `Rate limit hit ${info.timeDifference + ': ' + info.timeout || 'Unknown timeout '}`
      console.error(errorColor(msg));
      console.error(info);
      sendErrorMsg(msg)
    });

}