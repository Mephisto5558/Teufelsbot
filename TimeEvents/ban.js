module.exports = {
  time: '*/5 * * * *',
  startNow: true,

  onTick: async ({ botType, log, db }) => {
    if (botType == 'dev') log('started ban check');

    const oldData = db.get('tempbans');

    for (const guild of Object.entries(oldData)) {
      if (guild[1])
    }
  },

}