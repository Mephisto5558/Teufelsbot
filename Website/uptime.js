module.exports = {
  method: ['get'],

  run: async (res, _, client) => {
    res.send(client.functions.uptime(client));
  }
} 