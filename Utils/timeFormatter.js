/**@param {number}sec @param {lang}lang*/
module.exports = (sec = 0, lang = null) => {
  const negative = sec < 0;
  sec = Math.abs(sec);

  const
    y = Math.floor(sec / (60 * 60 * 24 * 365)),
    secAfterYears = sec % (60 * 60 * 24 * 365),
    mo = Math.floor(secAfterYears / (60 * 60 * 24 * 30.44)),
    secAfterMonths = secAfterYears % (60 * 60 * 24 * 30.44),
    d = Math.floor(secAfterMonths / (60 * 60 * 24)),
    secAfterDays = secAfterMonths % (60 * 60 * 24),
    h = Math.floor(secAfterDays / (60 * 60)),
    secAfterHours = secAfterDays % (60 * 60),
    m = Math.floor(secAfterHours / 60),
    s = Math.floor(secAfterHours % 60);

  let id = 'others.timeFormatter.';
  if (lang) {
    if (y) id += 'ymdhms';
    else if (mo) id += 'mdhms';
    else if (d) id += 'dhms';
    else if (h) id += 'hms';
    else id += m ? 'ms' : 's';
  }

  return {
    total: sec * 1000, negative,
    formatted: (lang?.(id, { y, mo, d, h, m, s }) ?? `${y.toString().padStart(4, '0')}-${mo.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}, ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
  };
};
