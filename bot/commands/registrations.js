const { MessageEmbed, MessageAttachment } = require("discord.js");

const cassini = require("../../services/cassini");
const { RegistrationsManager } = require("../../services/registrations");

module.exports = (client) => {

  async function registrationsstatus(interaction) {

    let guild = await client.guilds.fetch(interaction.guild_id);
    let roles = await Promise.all(interaction.member.roles.map(id => guild.roles.fetch(id)));
    let rolenames = roles.map(role => role.name);

    var location = interaction.data.options?.find(option => option.name === "location")?.value;

    if (cassini.iscoreteammember(rolenames)) {

      // Nothing to check here

    } else if (cassini.islocalorganiser(rolenames)) {

      crewmemberlocation = cassini.getcrewmemberlocation(rolenames);

      if (!crewmemberlocation) {
        return { type: 4, data: { content: "You need a local crewmember role to see registrations for a hackathon location.", flags: 1 << 6 } };
      }

      if (location && location != crewmemberlocation) {
        return { type: 4, data: { content: "You do not have permission to see registrations for this hackathon location.", flags: 1 << 6 } };
      }

      location = location ?? crewmemberlocation;
    }

    let registrationsmanager = new RegistrationsManager();

    await registrationsmanager.loadalldata();

    var registrations = registrationsmanager.getallregistrations(location);

    let websiteregistrations = registrations.filter((registration) => registration.subscriber && registration.subscriber.isactive && registration.subscriber.isconsented);

    let today = new Date();
    let lastweek = today.setDate(today.getDate() - 7);
    let lastweekswebsiteregistrations = websiteregistrations.filter((r) => new Date(r.subscriber.created) > lastweek);

    let additionaleventtiaregistrations = registrations.filter((registration) => !registration.subscriber && registration.attendee);

    const embed = new MessageEmbed();
    embed.setTitle(location ? `Website registrations for ${cassini.gethackathonname(location)}` : `All website registrations`);
    embed.addField("Total website registrations", `${websiteregistrations.length} registrations`, true);
    embed.addField("Last week's website registrations", `${lastweekswebsiteregistrations.length} registrations`, true);
    embed.addField("Additional event platform registrations", `${additionaleventtiaregistrations.length} registrations`);
    embed.setTimestamp();

    return { type: 4, data: { embeds: [ embed ], flags: 1 << 6 } };
  }

  return {
    name: "registrations",
    description: "See registrations for the hackathon.",
    options: [
      {
        name: "status",
        description: "Get registrations status update.",
        type: 1,
        options: [
          {
              name: "location",
              description: "The hackathon location of interest",
              type: 3,
              required: false,
              choices: cassini.getlocations().map((location) => ({ name: cassini.gethackathonname(location), value: location }))
          }
        ],
        run: registrationsstatus
      },
      // {
      //   name: "check",
      //   description: "Check registrations for an email address.",
      //   type: 1,
      //   run: () => undefined
      // },
      // {
      //   name: "analyse",
      //   description: "Analyse registrations issues.",
      //   type: 1,
      //   run: () => undefined
      // }
    ],
    default_permission: false,
    allowedroles: [
      cassini.coreteammemberlabel(),
      cassini.localorganiserlabel()
    ]
  };

}
