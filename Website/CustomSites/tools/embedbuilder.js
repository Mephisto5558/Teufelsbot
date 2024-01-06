

module.exports = {
  title: 'Embedbuilder',

  /**@this WebServer @param {Res}res @param {Req}req*/
  run: function (res, req) {
    const query = req.originalUrl.split(/(?=\?)/g)?.pop(); //Keep the "?" | using ?data=e30= because e30= is {} in base64 so we don't have default values
    return res.send(`<iframe src="https://glitchii.github.io/embedbuilder?nouser&hidemenu&data=e30=${query?.startsWith('?') ? '&' + query.slice(1) : ''}" width="100%" height="100%" frameborder="0" marginheight="0" marginwidth="0" allow="clipboard-write *">Loading…</iframe>`);
  }
};