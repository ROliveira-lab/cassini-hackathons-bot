const { Collection } = require("discord.js");

module.exports = (client) => {

  const commands = new Collection();

  commands.set("ping", require("./ping"));
  // commands.set("echo", require("./echo"));
  // commands.set("sum", require("./sum"));
  // commands.set("self", require("./self"));
  // commands.set("where", require("./where"));
  commands.set("invites", require("./invites"));

  function registercommands(guild, commands) {
    client.api.applications(client.user.id).guilds(guild.id).commands.put({ data: commands }).catch(console.error)
      .then((commands) => { console.log(`${client.user.username} has registered ${commands.length} commands for server ${guild.name}`); });
  }

  client.once("ready", () => {
    for (let [guildid, guild] of client.guilds.cache) {
      registercommands(guild, commands);
    }
  });

  client.once("guildCreate", (guild) => {
    registercommands(guild, commands);
  });

  client.ws.on("INTERACTION_CREATE", async (interaction) => {
    console.log(`[${client.guilds.cache.get(interaction.guild_id)}]: Command ${interaction.data.name} initiated by ${interaction.member.user.username}`);

    if (commands.has(interaction.data.name)) {
      let data = await commands.get(interaction.data.name).run(interaction);
      client.api.interactions(interaction.id, interaction.token).callback.post({ data }).catch(console.error);
    }
  });

  return commands;

}