const { MessageEmbed, MessageAttachment } = require("discord.js");

const cassini = require("../../services/cassini");
const { RegistrationsManager, RegistrationsReport } = require("../../services/registrations");

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

    let registrations = registrationsmanager.getallregistrations(location);

    let registrationsreport = new RegistrationsReport(registrations);
    
    const embed = new MessageEmbed();
    embed.setTitle(location ? `Registrations for ${cassini.gethackathonname(location)}` : `All registrations`);

    embed.setDescription(`${registrationsreport.total()} unique people have registered for the hackathon across all platforms`)

    let websitetotal = registrationsreport.websitetotal();
    embed.addField("➜ Website registrations", `${websitetotal} registrations in total (${registrationsreport.websitesince(7, "days")} last week)`);
    embed.addField("Active", `${registrationsreport.websiteactive()} registrations`, true);
    embed.addField("Unconfirmed", `${registrationsreport.websiteunconfirmed()} registrations`, true);
    embed.addField("No consent", `${registrationsreport.websitenoconsent()} registrations`, true);

    embed.addField("➜ Junction registrations", `${registrationsreport.junctiontotal()} registrations in total (${registrationsreport.junctionsince(7, "days")} last week)`);
    let junctionfromwebsite =registrationsreport.junctionfromwebsite();
    let junctionfromwebsiterelative = (junctionfromwebsite / websitetotal * 100).toFixed();
    embed.addField("From website", `${junctionfromwebsite} registrations (${junctionfromwebsiterelative}%)`, true);
    embed.addField("Additional", `${registrationsreport.junctionadditional()} registrations`, true);

    embed.addField("➜ Eventtia registrations", `${registrationsreport.eventtiatotal()} registrations in total (${registrationsreport.eventtiasince(7, "days")} last week)`);
    let eventtiafromwebsite = registrationsreport.eventtiafromwebsite();
    let eventtiafromwebsiterelative = (eventtiafromwebsite / websitetotal * 100).toFixed();
    embed.addField("From website", `${eventtiafromwebsite} registrations (${eventtiafromwebsiterelative}%)`, true);
    embed.addField("Additional", `${registrationsreport.eventtiaadditional()} registrations`, true);

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
