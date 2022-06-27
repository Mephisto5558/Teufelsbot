const
  express = require('express'),
  favicon = require('serve-favicon'),
  { existsSync } = require('fs'),
  { join } = require('path'),
  rateLimit = require('express-rate-limit'),
  errorColor = require('chalk').bold.red,
  app = express(),
  router = express.Router(),
  websiteMessages = [
    'Hello World!', 'Lena is kuhl',
    'Flo is kuhl', 'Vinni is auch kuhl',
    'huhu', 'What are you doing here?',
    '<body style="background-color:black;"><iframe src="https://www.youtube.com/embed/xvFZjo5PgG0?autoplay=1&amp;loop=1&amp;rel=0&amp;controls=0&amp;showinfo=0&amp;mute=1" width="100%" height="100%" scrolling="auto" allowfullscreen frameborder="0"></iframe></body>'
  ];

module.exports = async client => {
  if (client.botType == 'dev') return client.log('Skipped website loading due to dev version.');

  app
    .use(favicon('Website/favicon.ico'))
    .use(rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 20 // 20 requests per minute
    }))
    .use(express.json())
    .set('json spaces', 2)
    .use((req, res, next) => {
      if (req.path.endsWith('/') && req.path > 1) res.redirect(301, req.path.slice(0, -1));
      else next();
    })
    .use(router)
    .use((err, req, res, __) => {
      console.error(errorColor(' [Error Handling] :: Unhandled Website Error/Catch'));
      console.error(req, res);
      console.error(err.stack);
      res.status(500).send('Something went wrong.\nPlease message the dev.!');
    })

    .listen(8000, _ => {
      client.log(`Website is online\n`)
    });

  router.all('*', (req, res) => {
    if (req.path == '/') return res.send(websiteMessages[Math.floor(Math.random() * websiteMessages.length)]);

    const urlPath = join(`${__dirname}/../Website/${req.path}`);

    if (existsSync(`${urlPath}.js`)) {
      const cmd = require(`${urlPath}.js`);

      if (cmd.method == '*' || cmd.method?.includes(req.method.toLowerCase())) return cmd.run(res, req, client);
      return res.sendStatus(405);
    }

    return res.sendStatus(404);
  })

}