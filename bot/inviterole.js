const { capitalCase, paramCase } = require("change-case");

const model = require("./model");
const cassini = require("../services/cassini");

module.exports = (client) => {

  function findusedinvite(oldinvites, newinvites) {
    return newinvites.find(invite => oldinvites.has(invite.code) && oldinvites.get(invite.code).uses < invite.uses);
  }

  async function getroles(guild, level, country) {
    let roles = await guild.roles.fetch().catch(console.error);
    let globalrole = roles.cache.find(role => role.name === `${capitalCase(level)}`);
    let localrole = roles.cache.find(role => role.name === `${capitalCase(level)} ${country}`);
    return [globalrole, localrole];
  }
    
  async function assignroles(member, level, country) {
    let roles = await getroles(member.guild, level, country);
    roles = roles.filter(role => role != undefined && role.editable);
    member.roles.set(roles);
    return roles;
  }

  function getcategory(guild, country) {
    return guild.channels.cache.find(channel => channel.type = "category" && channel.name === cassini.gethackathonname(country));
  }

  function getcrewchannel(guild, country) {
    return getcategory(guild, country)?.children.find(channel => channel.name === `${paramCase(country)}-crew`);
  }

  client.on("guildMemberAdd", async (member) => {
    console.log(`[${member.guild}]: Guild member added: ${member}`);

    let oldinvites = model.getinvitesforguild(member.guild);
    let newinvites = await model.loadinvitesforguild(member.guild);

    let invite = findusedinvite(oldinvites, newinvites);

    if (!invite) { return null; }

    let country = cassini.gethackathonlocation(invite.channel.parent.name);
    
    if (!country) { return null; }

    if(member.manageable) {
      let [globalrole, localrole] = await assignroles(member, "visitor", country);
      getcrewchannel(member.guild, country)?.send(`${member} joined the server and was assigned the ${globalrole} and ${localrole} roles.`);  
      member.send(`Welcome to the ${member.guild} server. You have been assigned the ${globalrole?.name} and ${localrole?.name} roles.`);
    }
  });
}