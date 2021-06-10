const { Collection } = require("discord.js");

module.exports = (client) => {

  const commands = new Collection();

  commands.set("ping", require("./ping"));
  commands.set("invites", require("./invites"));
  commands.set("registrations", require("./registrations")(client));
  commands.set("allow", require("./allow")(client));

  async function registercommands(guild, commandprototypes) {
    await client.api.applications(client.user.id).guilds(guild.id).commands.put({ data: [] }).catch(console.error);
    let commands = await Promise.all(commandprototypes.map((commandprototype) => registercommand(guild, commandprototype)));
  }

  async function registercommand(guild, commandprototype) {
    let command = await client.api.applications(client.user.id).guilds(guild.id).commands.post({ data: commandprototype }).catch(console.error);

    if (commandprototype.allowedroles) {
      
      let roles = await guild.roles.fetch().catch(console.error);

      let permissions = commandprototype.allowedroles.map((rolename) => {
        let role = roles.cache.find(role => role.name === rolename);
        return role ? { id: role.id, type: 1, permission: true } : undefined;
      })

      await client.api.applications(client.user.id).guilds(guild.id).commands(command.id).permissions.put({ data: { permissions } }).catch(console.error);
    }

    console.log(`${client.user.username} has registered command ${command.name} for server ${guild.name}`);

    return command;
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
      let command = await commands.get(interaction.data.name);

      if (interaction.data.options?.some(option => option.type === 2)) {
        interaction.data = interaction.data.options.find(option => option.type === 2);
        command = command.options.find(option => option.type === 2 && option.name === interaction.data.name);
      }
    
      if (interaction.data.options?.some(option => option.type === 1)) {
        interaction.data = interaction.data.options.find(option => option.type === 1);
        command = command.options.find(option => option.type === 1 && option.name === interaction.data.name);
      }

      await client.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 5, data: { flags: 1 << 6 } } }).catch(console.error);

      var data = await command.run(interaction).catch((error) => {
        if (error.data != undefined) { return error.data; } else { throw error; }
      });

      await client.api.webhooks(interaction.application_id, interaction.token).messages("@original").patch({ data }).catch(console.error);
    }
  });

  return commands;

}