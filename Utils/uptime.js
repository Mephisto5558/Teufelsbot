module.exports = (asMessage, lang) => {
  let data;
  
  const s = process.uptime();
  const d = Math.floor(s / (60 * 60 * 24));
  const h = Math.floor((s / (60 * 60)) % 24);
  const m = Math.floor((s / 60) % 60);
  const sec = Math.floor(s % 60);
  
  if (asMessage && lang) {
    if (d > 0) data = lang('dhms', { d, h, m, sec });
    else if (h > 0) data = lang('hms', { h, m, sec });
    else if (m > 0) data = lang('ms', { m, sec });
    else data = lang('s', sec);
  }
  
  return {
    total: process.uptime() * 1000,
    formatted: data || `${d.toString().padStart(2, 0)}:${h.toString().padStart(2, 0)}:${m.toString().padStart(2, 0)}:${sec.toString().padStart(2, 0)}`
  };
};