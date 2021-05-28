const { Client } = require("discord.js");

module.exports = () => {

  const client = new Client();

  require("./trackinvites")(client);
  require("./inviterole")(client);
  require("./commands")(client);

  client.login(process.env.TOKEN);

  return client;

}
