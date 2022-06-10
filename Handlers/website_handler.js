const
  express = require('express'),
  favicon = require('serve-favicon'),
  rateLimit = require('express-rate-limit'),
  errorColor = require('chalk').bold.red,
  path = require('path'),
  app = express(),
  router = express.Router(),
  websiteMessages = [
    'Hello World!', 'Lena is kuhl',
    'Flo is kuhl', 'Vinni is auch kuhl',
    'huhu', 'What are you doing here?',
    'https://www.youtube.com/watch?v=xvFZjo5PgG0'
  ];

module.exports = async client => {
  if (client.botType == 'dev') return client.log('Disabled website loading due to dev version.');

  const websiteMessage = websiteMessages[Math.floor(Math.random() * websiteMessages.length)];

  app
    .use(favicon('Website/favicon.ico'))
    .use(express.json())
    .use(rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 20 // 20 requests per minute
    }))
    .use(router)
    .use(function (err, _, res, _) {
      console.error(errorColor(' [Error Handling] :: Unhandled Website Error/Catch'));
      console.error(err.stack);
      res.status(500).send('Something broke!');
    })
    .set('json spaces', 2)

    .listen(8000, _ => {
      client.log(`Website is online\n`)
    });

  router.all('*', async (req, res) => {
    if (req.method.toLowerCase() == 'get') {
      switch (req.path) {
        case '/uptime':
          let totalSeconds = client.uptime / 1000;
          let days = Math.floor(totalSeconds / 86400).toString().padStart(2, 0);
          totalSeconds %= 86400;
          let hours = Math.floor(totalSeconds / 3600).toString().padStart(2, 0);
          totalSeconds %= 3600;
          let minutes = Math.floor(totalSeconds / 60).toString().padStart(2, 0);
          let seconds = Math.floor(totalSeconds % 60).toString().padStart(2, 0);

          res.send({
            total: client.uptime,
            formatted: `${days}:${hours}:${minutes}:${seconds}`
          });
          break;

        case '/privacy':
          res.sendFile(path.join(__dirname + '/../Website/privacy_policy.html'));
          break;

        default: res.send(websiteMessage);
      }
    }
    else if (req.method.toLowerCase() == 'post') {
      if (req.body.token != client.keys.WebCommandKey) return res.sendStatus(403);

      switch (req.path) {
        case '/restart':
          res.send(true);
          console.error('Restart initiated from web server');
          process.exit(0);

        /*case '/ping': //Coming soon
          client.log('Ping initiated from web server');
          let data = await client.functions.ping;
          res.send(data);
          break;
        */
        default: res.status(404);
      }
    }
  });

}