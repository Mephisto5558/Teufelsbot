/**@param {boolean}asMessage*/
module.exports = (asMessage, lang) => {
  const
    up = process.uptime(),
    d = Math.floor(up / (60 * 60 * 24)),
    h = Math.floor((up / (60 * 60)) % 24),
    m = Math.floor((up / 60) % 60),
    s = Math.floor(up % 60);

  let id;
  if (asMessage && lang) {
    if (d) id = 'dhms';
    else if (h) id = 'hms';
    else id = m ? 'ms' : 's';
  }

  return {
    total: up * 1000,
    formatted: id ? lang(id, { d, h, m, s }) : `${d.toString().padStart(2, '0')}:${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  };
};
