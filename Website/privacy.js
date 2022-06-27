module.exports = {
  method: ['get'],

  run: res => {
    res.sendFile(`${__dirname}/privacy_policy.html`);
  }
}