const
  express = require('express'),
  favicon = require('serve-favicon'),
  app = express(),
  chalk = require("chalk"),
  errorColor = chalk.bold.red;

let websiteMessages = ['Hilfe der Dominik will mich entführen ahhh\nLG Meph', 'Hello World!', 'Lena is kuhl', 'Flo is kuhl', 'Vinni is auch kuhl', 'huhu', 'What are you doing here?', 'https://www.youtube.com/watch?v=xvFZjo5PgG0']

module.exports = async client => {
  if(client.botType == 'dev') return console.log('Disabled website loading due to dev version.');

  let websiteMessage = websiteMessages[Math.floor(Math.random() * websiteMessages.length)]

  app.use(favicon('./favicon.ico'));
  app.use(express.json());
  app.set('json spaces', 2);
  app.use(function(err, _, res, _) {
    console.error(errorColor(' [Error Handling] :: Unhandled Website Error/Catch'));
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  app.listen(8000, _ => {
    client.log(`Website is online\n`)
  });
  app.all('*', manage);
  app.get('*', (_, res) => {
    res.send(websiteMessage);
  });
  app.post('*', (_, res) => {
    res.status(404);
  });

  async function manage(req, res, next) {
    switch(req.method.toLowerCase()) {
      case 'get':
        switch(req.path) {
          case '/uptime':
            let totalSeconds = (client.uptime / 1000);
            let days = Math.floor(totalSeconds / 86400);
            totalSeconds %= 86400;
            let hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            let minutes = Math.floor(totalSeconds / 60);
            let seconds = Math.floor(totalSeconds % 60);
            if(days.toString().length === 1) days = `0${days}`;
            if(hours.toString().length === 1) hours = `0${hours}`;
            if(minutes.toString().length === 1) minutes = `0${minutes}`;
            if(seconds.toString().length === 1) seconds = `0${seconds}`;

            res.send({
              total: client.uptime,
              formatted: `${days}:${hours}:${minutes}:${seconds}`
            });
            break;
        }
        break;

      case 'post':
        if(req.body.token != client.keys.WebCommandKey) return res.sendStatus(403);

        switch(req.path) {
          case '/restart':
            res.send(true);
            console.error('Restart initiated from web server');
            process.exit(0);

          case '/ping':
            return; //Coming soon
            client.log('Ping initiated from web server');
            let data = await client.functions.ping;
            res.send(data);
            break;
        }
        break;
    }
    next();
  }

}