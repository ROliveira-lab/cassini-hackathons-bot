const { Collection } = require("discord.js");

const allinvites = new Collection();

function loadinvitesforguild(guild) {
  return guild.fetchInvites().then((invites) => { setinvitesforguild(guild, invites); return invites; }).catch(console.error);
}

function getinvitesforguild(guild) {
  return allinvites.get(guild.id) ?? new Collection();
}

function setinvitesforguild(guild, newinvites) {
  return allinvites.set(guild.id, newinvites);
}

function addinvitesforguild(guild, invites) {
  let oldinvites = getinvitesforguild(guild);
  let newinvites = oldinvites.concat(invites);
  return allinvites.set(guild.id, newinvites);
}

function removeinvitesforguild(guild) {
  return allinvites.delete(guild.id);
}

function removeinvitesforchannel(channel) {
  let invites = getinvitesforguild(channel.guild);
  invites.sweep(invite => invite.channel.id === channel.id);
  return allinvites.set(channel.guild.id, invites);
}

function addinvite(invite) {
  let invites = getinvitesforguild(invite.guild);
  invites.set(invite.code, invite);
  return allinvites.set(invite.guild.id, invites);
}

function removeinvite(invite) {
  let invites = getinvitesforguild(invite.guild);
  invites.delete(invite.code);
  return allinvites.set(invite.guild.id, invites);
}

module.exports = {
  loadinvitesforguild,
  getinvitesforguild,
  setinvitesforguild,
  addinvitesforguild,
  removeinvitesforguild,
  removeinvitesforchannel,
  addinvite,
  removeinvite,
}
