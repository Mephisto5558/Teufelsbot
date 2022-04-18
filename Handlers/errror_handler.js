module.exports = (client) => {
  
  process
    .on('unhandledRejection', (err, origin) => {
      console.log(' [Error Handling] :: Unhandled Rejection/Catch');
      console.log(err, origin);
      console.log(`\n`)
      
      if(!err.errorCode) err.errorCode = 'unknown'
      if(err.name === 'DiscordAPIError') client.interaction.channel.send("A Discord API Error occured, please try again and ping the dev if this keeps happening.")
      else client.interaction?.followUp(`A unknown error occurred, please ping the dev.\nError Code: \`${err.errorCode}\``);
    })
  
    .on('uncaughtException', (err, origin) => {
      console.log(' [Error Handling] :: Uncaught Exception/Catch');
      console.log(err, origin);
      console.log(`\n`);
      
      if(!err.errorCode) err.errorCode = 'unknown'
      client.interaction?.followUp(`A unknown error occurred, please ping the dev.\nError Code: \`${err.errorCode}\``);
    })
  
    .on('uncaughtExceptionMonitor', (err, origin) => {
      console.log(' [Error Handling] :: Uncaught Exception/Catch (MONITOR)');
      console.log(err, origin);
      console.log(`\n`);
      
      if(!err.errorCode) err.errorCode = 'unknown'
      client.interaction?.followUp(`A unknown error occurred, please ping the dev.\nError Code: \`${err.errorCode}\``);
    });
  
  client
    .on('rateLimit', (info) => {
      console.log(`Rate limit hit ${info.timeDifference ? info.timeDifference : info.timeout ? info.timeout: 'Unknown timeout '}`)
      client.interaction?.followUp(`Rate limit hit ${info.timeDifference ? info.timeDifference : info.timeout ? info.timeout: 'Unknown timeout '}`)
    });

}