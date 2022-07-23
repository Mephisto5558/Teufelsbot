module.exports = async client => {
  while (client.ws.status != 0) await client.functions.sleep(10);
  if (!client.application.name) await client.application.fetch();
  return true;
};