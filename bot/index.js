const { Client, Collection } = require("discord.js");

const { capitalCase, paramCase } = require("change-case");

const prefix = "!";

module.exports = (token) => {

  const client = new Client();

  const model = require("./model")();

  function connect(guild) {
    model.loadinvitesforguild(guild).then(() => { console.log(`${client.user.username} is connected to ${guild}`); });
  }

  function disconnect(guild) {
    model.removeinvitesforguild(guild)
    console.log(`${client.user.username} is disconnected from ${guild}`);
  }

  client.once("ready", () => {
    console.log(`${client.user.username} is ready!`);
    client.guilds.cache.forEach(connect);
  });
    
  client.once("guildCreate", (guild) => {
    console.log(`[${guild}]: Guild created`);
    connect(guild);
  });
    
  client.once("guildDelete", (guild) => {
    console.log(`[${guild}]: Guild deleted`);
    disconnect(guild);
  });

  client.on("inviteCreate", (invite) => {
    console.log(`[${invite.guild}]: Invite created: ${invite.code} --> ${invite.channel}`);
    const guildinvites = model.allinvites.get(invite.guild.id) ?? new Collection();
    guildinvites.set(invite.code, invite);
    model.allinvites.set(invite.guild.id, guildinvites);
  });
    
  client.on("inviteDelete", (invite) => {
    console.log(`[${invite.guild}]: Invite deleted: ${invite.code} --> ${invite.channel}`);
    const guildinvites = model.allinvites.get(invite.guild.id) ?? new Collection();
    guildinvites.delete(invite.code);
    model.allinvites.set(invite.guild.id, guildinvites);
  });

  client.on("channelDelete", (channel) => {
    console.log(`[${channel.guild}]: Channel deleted: ${channel}`);
    const guildinvites = model.allinvites.get(channel.guild.id) ?? new Collection();
    guildinvites.sweep(invite => invite.channel.id === channel.id)
    model.allinvites.set(channel.guild.id, guildinvites);
  });

  function findusedinvite(oldinvites, newinvites) {
    return newinvites.find(invite => oldinvites.has(invite.code) && oldinvites.get(invite.code).uses < invite.uses);
  }

  function getcountry(channel) {
    let matchresult = channel.parent.name.match(/^Hackathon (\w.*)$/);
    return matchresult ? matchresult[1] : undefined;
  }

  async function getroles(guild, level, country) {
    let roles = await guild.roles.fetch().catch(console.error);
    let globalrole = roles.cache.find(role => role.name === `${capitalCase(level)}`);
    let localrole = roles.cache.find(role => role.name === `${capitalCase(level)} ${country}`);
    return [globalrole, localrole];
  }

  async function assignroles(member, level, country) {
    let roles = await getroles(member.guild, level, country);
    roles = roles.map(role => role?.editable ? role : undefined);
    member.roles.set(roles.filter(role => role != undefined));
    return roles;
  }

  function getcategory(guild, country) {
    return guild.channels.cache.find(channel => channel.type = "category" && channel.name === `Hackathon ${country}`);
  }

  function getcrewchannel(guild, country) {
    return getcategory(guild, country)?.children.find(channel => channel.name === `${paramCase(country)}-crew`);
  }

  client.on("guildMemberAdd", async (member) => {
    console.log(`[${member.guild}]: Guild member added: ${member}`);

    const oldinvites = model.allinvites.get(member.guild.id) ?? new Collection();
    let newinvites = await member.guild.fetchInvites();
    model.allinvites.set(member.guild.id, newinvites);

    var invite = findusedinvite(oldinvites, newinvites);

    if (!invite) { return null; }

    var country = getcountry(invite.channel);
    
    if (!country) { return null; }

    if(member.manageable) {
      let [globalrole, localrole] = await assignroles(member, "visitor", country);
      getcrewchannel(member.guild, country)?.send(`${member} joined the server and was assigned the ${globalrole} and ${localrole} roles.`);  
      member.send(`Welcome to the ${member.guild} server. You have been assigned the ${globalrole?.name} and ${localrole?.name} roles.`);
    }
  });

  client.on("message", (message) => {
    if (message.author.bot) return;
    if (!message.member.hasPermission("ADMINISTRATOR")) return;
    if (!message.content.startsWith(prefix)) return;

    const body = message.content.slice(prefix.length);
    const args = body.split(' ');
    const command = args.shift().toLowerCase();

    console.log(`[${message.guild}]: Command: ${command}`);

    const commands = require("./commands")(model);

    if (command in commands) {
      commands[command](message, command, args);
    }
  });

  client.login(token);

}
