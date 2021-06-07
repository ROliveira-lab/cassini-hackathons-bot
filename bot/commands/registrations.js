const path = require("path");
const moment = require("moment");
const { MessageEmbed, APIMessage } = require("discord.js");

const cassini = require("../../services/cassini");
const { RegistrationsManager, RegistrationsReport, RegistrationsExporter } = require("../../services/registrations");

module.exports = (client) => {

  async function determinelocation(interaction) {

    var location = interaction.data.options?.find(option => option.name === "location")?.value;

    let guild = await client.guilds.fetch(interaction.guild_id);
    let roles = await Promise.all(interaction.member.roles.map(id => guild.roles.fetch(id)));
    
    let rolenames = roles.map(role => role.name);

    if (cassini.iscoreteammember(rolenames)) {

      // Nothing to check here

    } else if (cassini.islocalorganiser(rolenames)) {

      crewmemberlocation = cassini.getcrewmemberlocation(rolenames);

      if (!crewmemberlocation) {
        throw new Error(`You do not have permission to see registrations for ${cassini.gethackathonname(location)}. I could not find a local crew member role to determine your hackathon location.`);
      }

      if (location && location != crewmemberlocation) {
        throw new Error(`You do not have permission to see registrations for ${cassini.gethackathonname(location)}. I found a local crew member role for ${cassini.gethackathonname(crewmemberlocation)}.`);
      }

      location = crewmemberlocation;
    }

    return location;
  }

  async function registrationsstatus(interaction) {

    try {
      var location = await determinelocation(interaction);
    } catch (error) {
      return { type: 4, data: { content: error.message, flags: 1 << 6 } };
    }

    let registrationsmanager = new RegistrationsManager();

    await registrationsmanager.loadalldata();

    let registrations = registrationsmanager.getallregistrations(location);

    let registrationsreport = new RegistrationsReport(registrations);
    
    const embed = new MessageEmbed();
    embed.setTitle(location ? `Registrations for ${cassini.gethackathonname(location)}` : `All registrations`);

    embed.setDescription(`${registrationsreport.total()} unique people have registered for the hackathon across all platforms`);

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

  async function registrationslist(interaction) {

    try {
      var location = await determinelocation(interaction);
    } catch (error) {
      return { type: 4, data: { content: error.message, flags: 1 << 6 } };
    }

    let user = await client.users.fetch(interaction.member.user.id);
    
    let registrationsmanager = new RegistrationsManager();
    
    await registrationsmanager.loadalldata();

    let registrationsexporter = new RegistrationsExporter(registrationsmanager, process.env.DATA_FOLDER);

    let tags = [user.username, user.id, moment().toISOString()];

    let csv = await registrationsexporter.exportascsv(location, tags);
    
    let directmessagecontent = "Here is the registrations list you've requested. Download the file and store it safely. Always handle this personal data according to the applicable data protection rules and agreements. This message and its attachment will be deleted after 2 minutes."
    let directmessage = new APIMessage(user, { content: directmessagecontent, files: [ registrationsexporter.filepath(location, tags) ] });
    await directmessage.resolveData().resolveFiles();
    user.send(directmessage).then(message => { message.delete({ timeout: 120000 }); });

    let content = "I have sent you the registrations list in a direct message.";

    return { type: 4, data: { content, flags: 1 << 6 } };
  }

  return {
    name: "registrations",
    description: "See registrations for the hackathon.",
    options: [
      {
        name: "status",
        description: "Get a registrations status report.",
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
      {
        name: "list",
        description: "Get a list of registrations.",
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
        run: registrationslist
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
