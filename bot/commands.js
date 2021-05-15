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

  var invites = (message, command, args) => {
    const guildinvites = model.allinvites.get(message.guild.id) || new Collection();
    message.channel.send(guildinvites.map(invite => `${invite.code} --> ${invite.channel} (${invite.uses} uses)`));
  }

  return { ping, sum, where, self, invites }
}