const chalk = require("chalk");
const errorColor = chalk.bold.red;

module.exports = client => {

  function sendErrorMsg(msg) {
    if(client.message) {
      client.functions.reply(msg, client.message)
    } else if(client.interaction) {
      client.interaction.channel.send(msg)
    }
  };
  
  process
    .on('unhandledRejection', (err, origin) => {
      console.error(errorColor(' [Error Handling] :: Unhandled Rejection/Catch'));
      console.error(err, origin);
      console.error(`\n`)

      if(!err.errorCode) err.errorCode = 'unknown'
      if(err.name === 'DiscordAPIError') sendErrorMsg("A Discord API Error occured, please try again and ping the dev if this keeps happening.")
      else sendErrorMsg(`A unknown error occurred, please ping the dev.\nError Code: \`${err.errorCode}\``);
    })

  .on('uncaughtException', (err, origin) => {
    console.log(errorColor(' [Error Handling] :: Uncaught Exception/Catch'));
    console.log(err, origin);
    console.log(`\n`);

    if(!err.errorCode) err.errorCode = 'unknown'
    sendErrorMsg(`A unknown error occurred, please ping the dev.\nError Code: \`${err.errorCode}\``);
  })

  .on('uncaughtExceptionMonitor', (err, origin) => {
    console.error(errorColor(' [Error Handling] :: Uncaught Exception/Catch (MONITOR)'))
    console.error(err, origin);
    console.error(`\n`);

    if(!err.errorCode) err.errorCode = 'unknown'
    sendErrorMsg(`A unknown error occurred, please ping the dev.\nError Code: \`${err.errorCode}\``);
  });

  client
    .on('rateLimit', info => {
      const msg = `Rate limit hit ${info.timeDifference + ': ' + info.timeout || 'Unknown timeout '}`
      console.error(errorColor(msg));
      sendErrorMsg(msg)
    });

}