const { Collection } = require("discord.js");

module.exports = () => {

  const allinvites = new Collection();

  function loadinvitesforguild(guild) {
    return guild.fetchInvites().then((invites) => { addinvitesforguild(guild, invites); }).catch(console.error);
  }

  function addinvitesforguild(guild, invites) {
    return allinvites.set(guild.id, invites);
  }

  function removeinvitesforguild(guild) {
    allinvites.delete(guild.id);
  }

  function findinvitesforguild(guild) {
    return allinvites.get(guild.id) || new Collection();
  }

  return { allinvites, loadinvitesforguild, addinvitesforguild, removeinvitesforguild, findinvitesforguild }

}
