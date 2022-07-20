module.exports = {
  time: '*/5 * * * *',
  startNow: true,

  onTick: async client => {
    if(client.botType == 'dev') client.log('started ban check');

    const oldData = client.db.get('tempbans');

    for(const guild of Object.entries(oldData)) {
      if(guild[1])
    }
  },

}