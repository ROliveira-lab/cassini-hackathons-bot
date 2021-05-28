const model = require("./model");

module.exports = (client) => {

  client.once("ready", () => {
    console.log(`${client.user.username} is ready!`);
    for (let [guildid, guild] of client.guilds.cache) {
      model.loadinvitesforguild(guild).then(() => { console.log(`${client.user.username} is connected to ${guild}`); });
    }
  });

  client.once("guildCreate", (guild) => {
    console.log(`[${guild}]: Guild created`);
    model.loadinvitesforguild(guild).then(() => { console.log(`${client.user.username} is connected to ${guild}`); });
  });
    
  client.once("guildDelete", (guild) => {
    console.log(`[${guild}]: Guild deleted`);
    model.removeinvitesforguild(guild);
    console.log(`${client.user.username} is disconnected from ${guild}`);
  });

  client.on("inviteCreate", (invite) => {
    console.log(`[${invite.guild}]: Invite created: ${invite.code} --> ${invite.channel}`);
    model.addinvite(invite);
  });
    
  client.on("inviteDelete", (invite) => {
    console.log(`[${invite.guild}]: Invite deleted: ${invite.code} --> ${invite.channel}`);
    model.removeinvite(invite);
  });

  client.on("channelDelete", (channel) => {
    console.log(`[${channel.guild}]: Channel deleted: ${channel}`);
    model.removeinvitesforchannel(channel);
  });
}
