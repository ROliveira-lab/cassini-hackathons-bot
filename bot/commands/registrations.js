const { MessageEmbed, MessageAttachment } = require("discord.js");

const cassini = require("../../services/cassini");
const registrationsservice = require("../../services/registrations");

module.exports = (client) => {

  async function listregistrations(interaction) {

    let guild = await client.guilds.fetch(interaction.guild_id);
    let roles = await Promise.all(interaction.member.roles.map(id => guild.roles.fetch(id)));
    let rolenames = roles.map(role => role.name);

    if (cassini.iscoreteammember(rolenames)) {

      var registrations = await registrationsservice.website.getregistrations();

    } else if (cassini.islocalorganiser(rolenames) && cassini.iscrewmember(rolenames)) {

      var location = cassini.getcrewmemberlocation(rolenames);
      var registrations = await registrationsservice.website.getregistrations(location);

    }

    let today = new Date();
    let lastweek = today.setDate(today.getDate() - 7);
    let lastweeksregistrations = registrations.filter((r) => new Date(r.created) > lastweek);

    const embed = new MessageEmbed();
    embed.setTitle(location ? `Website registrations for ${cassini.gethackathonname(location)}` : `All website registrations`);
    embed.addField("Total", `${registrations.length} registrations`, true);
    embed.addField("Last week", `${lastweeksregistrations.length} registrations`, true);
    embed.setTimestamp();

    return { type: 4, data: { embeds: [ embed ], flags: 1 << 6 } };
  }

  return {
    name: "registrations",
    description: "See registrations for the hackathon.",
    options: [
      {
        name: "list",
        description: "List all registrations.",
        type: 1,
        run: listregistrations
      },
      {
        name: "check",
        description: "Check registrations for an email address.",
        type: 1,
        run: () => undefined
      },
      {
        name: "analyse",
        description: "Analyse registrations issues.",
        type: 1,
        run: () => undefined
      }
    ],
    default_permission: false,
    allowedroles: [
      cassini.coreteammemberlabel(),
      cassini.localorganiserlabel()
    ]
  };

}
