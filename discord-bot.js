const { Client, Collection } = require("discord.js");

module.exports = (token, prefix, countries) => {

  const client = new Client();

  const allinvites = new Collection();

  client.once("ready", () => {
    console.log(`${client.user.username} is ready!`);

    client.guilds.cache.map(guild => {
      guild.fetchInvites()
        .then(invites => {
          allinvites.set(guild.id, invites);
          console.log(`${client.user.username} is connected to ${guild}`);
        })
        .catch(error => {
          console.error(error);
        });
    });
  });
    
  client.once("guildCreate", (guild) => {
    console.log(`[${guild}]: Guild created`);
    guild.fetchInvites().then(invites => { allinvites.set(guild.id, invites); }).catch(error => { console.error(error); });
  });
    
  client.once("guildDelete", (guild) => {
    console.log(`[${guild}]: Guild deleted`);
    allinvites.delete(guild.id);
  });

  client.on("inviteCreate", (invite) => {
    console.log(`[${invite.guild}]: Invite created: ${invite.code} --> ${invite.channel}`);
    const guildinvites = allinvites.get(invite.guild.id) || new Collection();
    guildinvites.set(invite.code, invite);
    allinvites.set(invite.guild.id, guildinvites);
  });
    
  client.on("inviteDelete", (invite) => {
    console.log(`[${invite.guild}]: Invite deleted: ${invite.code} --> ${invite.channel}`);
    const guildinvites = allinvites.get(invite.guild.id) || new Collection();
    guildinvites.delete(invite.code);
    allinvites.set(invite.guild.id, guildinvites);
  });

  client.on("channelDelete", (channel) => {
    console.log(`[${channel.guild}]: Channel deleted: ${channel}`);
    const guildinvites = allinvites.get(channel.guild.id) || new Collection();
    guildinvites.sweep(invite => invite.channel.id === channel.id)
    allinvites.set(channel.guild.id, guildinvites);
  });

  client.on("guildMemberAdd", (member) => {
    console.log(`[${member.guild}]: Guild member added: ${member}`)
    const guildinvites = allinvites.get(member.guild.id) || new Collection();
    member.guild.fetchInvites().then(newinvites => {
      allinvites.set(member.guild.id, newinvites);
      var invite = newinvites.find(invite => guildinvites.has(invite.code) && guildinvites.get(invite.code).uses < invite.uses);
      if (!invite) { return null; }
      var country = countries.find(country => invite.channel.parent.name.includes(country));
      if (!country) { return null; }
      member.guild.roles.fetch().then(roles => {
        var visitorrole = roles.cache.find(role => role.name === "Visitor");
        var localvisitorrole = roles.cache.find(role => role.name.startsWith("Visitor") && role.name.endsWith(country));
        member.roles.add(visitorrole);
        member.roles.add(localvisitorrole);
        crewchannel = invite.channel.parent.children.find(channel => channel.name.startsWith(country.toLowerCase()) && channel.name.endsWith("crew"));
        crewchannel.send(`${member} joined the server and was assigned ${visitorrole} and ${localvisitorrole} roles.`);
        member.send(`Welcome to the ${member.guild} server. You have been assigned ${visitorrole} and ${localvisitorrole} roles.`)
      }).catch(console.error);
    }).catch(console.error);
  });

  client.on("message", function(message) {
    if (message.author.bot) return;
    if (!message.member.hasPermission("ADMINISTRATOR")) return;
    if (!message.content.startsWith(prefix)) return;

    const commandbody = message.content.slice(prefix.length);
    const args = commandbody.split(' ');
    const command = args.shift().toLowerCase();

    console.log(`[${message.guild}]: Command: ${command}`);

    if (command === "ping") {
      const timeTaken = Date.now() - message.createdTimestamp;
      message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
    }

    else if (command === "sum") {
      const sum = args.map(x => parseFloat(x)).reduce((counter, x) => counter += x);
      message.reply(`The sum of all the arguments you provided is ${sum}!`);
    }

    // else if (command === "where") {
    //   message.reply(`You are in the ${message.guild.name} server.`);
    // }

    // else if (command === "self") {
    //   message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
    // }

    else if (command === "invites") {
      const guildinvites = allinvites.get(message.guild.id) || new Collection();
      message.channel.send(guildinvites.map(invite => `${invite.code} --> ${invite.channel} (${invite.uses} uses)`));
    }
  });

  client.login(token);

}
