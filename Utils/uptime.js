module.exports = (asMessage, lang) => {
  let data;
  
  const up = process.uptime();
  const d = Math.floor(up / (60 * 60 * 24));
  const h = Math.floor((up / (60 * 60)) % 24);
  const m = Math.floor((up / 60) % 60);
  const s = Math.floor(up % 60);
  
  if (asMessage && lang) {
    if (d > 0) data = lang('dhms', { d, h, m, s });
    else if (h > 0) data = lang('hms', { h, m, s });
    else if (m > 0) data = lang('ms', { m, s });
    else data = lang('up', s);
  }
  
  return {
    total: process.uptime() * 1000,
    formatted: data || `${d.toString().padStart(2, 0)}:${h.toString().padStart(2, 0)}:${m.toString().padStart(2, 0)}:${s.toString().padStart(2, 0)}`
  };
};