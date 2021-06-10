const cassini = require("../../services/cassini");

module.exports = (client) => {

  function inferaccesslevel(guild, member) {

    let roles = member.roles.map(id => guild.roles.cache.get(id));

    let rolenames = roles.map(role => role.name);

    if (cassini.iscoreteammember(rolenames)) {

      return [cassini.coreteammemberlabel(), null];

    } else if (cassini.islocalorganiser(rolenames)) {

      return [cassini.localorganiserlabel(), cassini.iscrewmember(rolenames) ? cassini.getcrewmemberlocation(rolenames) : undefined];

    } else if (cassini.iscrewmember(rolenames)) {

      return [cassini.crewmemberlabel(), cassini.getcrewmemberlocation(rolenames)];

    } else if (cassini.isexpert(rolenames)) {

      return [cassini.expertlabel(), cassini.getexpertlocation(rolenames)];

    } else if (cassini.ishacker(rolenames)) {

      return [cassini.hackerlabel(), cassini.gethackerlocation(rolenames)];

    } else if (cassini.isvisitor(rolenames)) {

      return [cassini.visitorlabel(), cassini.getvisitorlocation(rolenames)];

    } else {

      return [undefined, undefined]

    }

  }

  function allowedlocationsfor(principallocation) {

    if (principallocation === undefined) {

      return [];

    } else if (principallocation === null) {

      return cassini.getlocations();

    } else {

      return [principallocation];

    }

  }

  function getrolesforlevel(guild, level, location) {
    let globalrole = guild.roles.cache.find(role => role.name === `${level}`);
    let localrole = guild.roles.cache.find(role => role.name === `${level} ${location}`);
    return [globalrole, localrole];
  }

  async function allow(interaction) {

    let guild = await client.guilds.fetch(interaction.guild_id);
    
    await guild.roles.fetch();

    let [principallevel, principallocation] = inferaccesslevel(guild, interaction.member);    

    let allowedlocations = allowedlocationsfor(principallocation);

    let requestedlocation = interaction.data.options?.find(option => option.name === "location")?.value;

    let userid = interaction.data.options.find(option => option.name === "member").value;
    let member = interaction.data.resolved.members[userid]

    let [memberlevel, memberlocation] = inferaccesslevel(guild, member);

    member = await guild.members.fetch(userid);

    if (requestedlocation != undefined) {

      if (!allowedlocations.includes(requestedlocation)) {
        throw { data: { content: `You do not have permissions for ${cassini.gethackathonname(requestedlocation)}.`, flags: 1 << 6 } };
      }

      var location = requestedlocation

    } else {

      if (memberlocation != undefined) {

        if (!allowedlocations.includes(memberlocation)) {
          throw { data: { content: `I inferred that ${member} is part of ${cassini.gethackathonname(memberlocation)}, but you do not have permissions for this hackathon location.`, flags: 1 << 6 } };
        }

        var location = memberlocation;

      } else {

        if (allowedlocations.length === 0) {
          throw { data: { content: `I could not infer the hackathon location: You do not have permissions for any hackathon location.`,  flags: 1 << 6 } };
        }

        if (allowedlocations.length > 1) {
          throw { data: { content: `I could not infer the hackathon location: You need to specify the hackathon location.`, flags: 1 << 6 } };
        }

        var location = allowedlocations[0];
        
      }

    }

    let level = interaction.data.options.find(option => option.name === "level").value;

    let roles = getrolesforlevel(guild, level, location);

    await member.roles.set(roles);

    let content = `I have changed the access level of ${member} to ${level} for ${cassini.gethackathonname(location)}.`;

    return { type: 4, data: { content, flags: 1 << 6 } };
  }

  return {
    name: "allow",
    description: "Change a member's access level for a hackathon location",
    options: [
      {
        name: "member",
        description: "The member to update",
        type: 6,
        required: true
      },
      {
        name: "level",
        description: "The access level",
        type: 3,
        required: true,
        choices: cassini.getassignableaccesslevels().map((level) => ({ name: level, value: level }))
      },
      {
        name: "location",
        description: "The hackathon location",
        type: 3,
        required: false,
        choices: cassini.getlocations().map((location) => ({ name: cassini.gethackathonname(location), value: location }))
    }
    ],
    run: allow,
    default_permission: false,
    allowedroles: [
      cassini.coreteammemberlabel(),
      cassini.localorganiserlabel()
    ]
  };

}
