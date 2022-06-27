module.exports = {
  method: ['post'],

  run: (res, req, client) => {
    if(!client.keys.webCommandKey) {
      res.sendStatus(501)
      throw new Error('Missing webCommandKey var for external restarting!')
    }
    if (req.body.token != client.keys.webCommandKey) return res.sendStatus(401);

    res.status(200).send(true);
    console.error('Restart initiated from web server');
    process.exit(0);
  }
}