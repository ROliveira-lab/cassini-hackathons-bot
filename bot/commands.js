const { Collection } = require("discord.js");

module.exports = (model) => {

  var ping = (message, command, args) => {
    const timediff = Date.now() - message.createdTimestamp;
    message.reply(`Pong! This message had a latency of ${timediff}ms.`);
  };

  var sum = (message, command, args) => {
    const sum = args.map(x => parseFloat(x)).reduce((counter, x) => counter += x);
    message.reply(`The sum of all the arguments you provided is ${sum}!`);
  };

  var where = (message, command, args) => {
    message.reply(`You are in the ${message.guild.name} server.`);
  };

  var self = (message, command, args) => {
    message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
  }

  function groupinvitesbycategory(invites) {
    let groups = []
    groups = invites.reduce((groups, invite) => {
      let category = invite.channel.parent;
      groups[category.position] = { name: category.name, invites: [] };
      return groups;
    }, groups);
    groups = invites.reduce((groups, invite) => {
      let category = invite.channel.parent;
      let channel = invite.channel;
      groups[category.position].invites[channel.position] = invite;
      return groups;
    }, groups);
    return groups.filter(group => group != undefined).map(group => ({ name: group.name, invites: group.invites.filter(invite => invite != undefined) }));
  }

  function formatinvite(invite) {
    return `${invite.code} ➜ ${invite.channel} (${invite.uses} uses)`;
  }

  var invites = (message, command, args) => {
    let invites = model.findinvitesforguild(message.guild);
    let groups = groupinvitesbycategory(invites);
    message.channel.send(groups.map(group => [`**${group.name}**`, ...group.invites.map(formatinvite), ""]).flat());
  }

  return { ping, sum, where, self, invites }
}