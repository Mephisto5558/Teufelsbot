let json = {
  "token": process.env.token,
  "uptimeAPIKey": process.env.uptimeAPIKey,
  "WebCommandKey": process.env.webCommandKey,
  "jokes": {
    "rapidAPIKey": process.env.rapidAPIKey,
    "humorAPIKey": process.env.humorAPIKey
  }
}
module.exports = json;