const invitemanager = require("./invitemanager");

module.exports = (client) => {

  client.once("ready", () => {
    console.log(`${client.user.username} is ready!`);
    for (let [guildid, guild] of client.guilds.cache) {
      invitemanager.loadinvitesforguild(guild).then(() => { console.log(`${client.user.username} is connected to ${guild}`); });
    }
  });

  client.once("guildCreate", (guild) => {
    console.log(`[${guild}]: Guild created`);
    invitemanager.loadinvitesforguild(guild).then(() => { console.log(`${client.user.username} is connected to ${guild}`); });
  });
    
  client.once("guildDelete", (guild) => {
    console.log(`[${guild}]: Guild deleted`);
    invitemanager.removeinvitesforguild(guild);
    console.log(`${client.user.username} is disconnected from ${guild}`);
  });

  client.on("inviteCreate", (invite) => {
    console.log(`[${invite.guild}]: Invite created: ${invite.code} --> ${invite.channel}`);
    invitemanager.addinvite(invite);
  });
    
  client.on("inviteDelete", (invite) => {
    console.log(`[${invite.guild}]: Invite deleted: ${invite.code} --> ${invite.channel}`);
    invitemanager.removeinvite(invite);
  });

  client.on("channelDelete", (channel) => {
    console.log(`[${channel.guild}]: Channel deleted: ${channel}`);
    invitemanager.removeinvitesforchannel(channel);
  });
}
