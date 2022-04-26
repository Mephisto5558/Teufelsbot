const express = require("express");
const app = express();

module.exports = (client) => {

  websiteMessages = ['Hilfe der Dominik will mich entführen ahhh\nLG Meph', 'Hello World!', 'Lena is kuhl', 'Flo is kuhl', 'Vinni is auch kuhl', 'huhu', 'What are you doing here?', 'https://www.youtube.com/watch?v=xvFZjo5PgG0']
  websiteMessage = websiteMessages[Math.floor(Math.random() * websiteMessages.length)]

  app.use(express.urlencoded({ extended: true }));
  app.use('/website.ico', express.static('./website.ico'));
  app.use(express.json());
  app.set('json spaces', 2);

  app.listen(1000, _ => {
    console.log(`Website is online\n`)
  });
  app.all('*', manage);

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
        if(req.body.token != process.env.WebCommandKey) return res.sendStatus(403);

        switch(req.path) {
          case '/restart':
            res.send(true);
            console.error("Restart initiated from web server");
            process.exit(0)
           break;

          case '/ping': //Comming soon
            console.log("Ping initiated from web server");
            data = await client.functions.ping;
            res.send(data);
          break;
        }
      break;
    }
    next();
  }
}