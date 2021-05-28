const { Client } = require("discord.js");

module.exports = () => {

  const client = new Client();

  const model = require("./model");

  require("./trackinvites")(client);
  require("./inviterole")(client);
  require("./commands")(client);

  client.login(process.env.TOKEN);

  return client;

}
