const moment = require("moment");
const { MessageEmbed, APIMessage } = require("discord.js");

const cassini = require("../../services/cassini");
const { RegistrationsManager, RegistrationsReport, RegistrationsExport } = require("../../services/registrations");

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
        throw { data: { content: `You do not have permission to see registrations for ${cassini.gethackathonname(location)}. I could not find a local crew member role to determine your hackathon location.`, flags: 1 << 6 } };
      }

      if (location && location != crewmemberlocation) {
        throw { data: { content: `You do not have permission to see registrations for ${cassini.gethackathonname(location)}. I found a local crew member role for ${cassini.gethackathonname(crewmemberlocation)}.`, flags: 1 << 6 } };
      }

      location = crewmemberlocation;
    }

    return location;
  }

  async function registrationsstatus(interaction) {

    var location = await determinelocation(interaction);

    let registrationsmanager = new RegistrationsManager({ subscribergroup: cassini.getshortname() });

    let registrationsreport = new RegistrationsReport(registrationsmanager);

    await registrationsreport.generate(location);
    
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

    return { embeds: [ embed ], flags: 1 << 6 };
  }

  async function registrationscheck(interaction) {

    var location = await determinelocation(interaction);

    var email = interaction.data.options.find(option => option.name === "email").value;

    let registrationsmanager = new RegistrationsManager({ subscribergroup: cassini.getshortname() });

    await registrationsmanager.loadone(email);

    let registration = await registrationsmanager.getregistration(email, location);
    
    const embed = new MessageEmbed();
    embed.setTitle(`Registration check for ${email}`);

    if (registration) {

      if (location) {
        embed.setDescription(`A registration was found for ${cassini.gethackathonname(location)}.`);
      } else {
        embed.setDescription(`A registration was found.`);
      }

      if (registration.subscriber) {
        embed.addField("➜ Website registration", `Registered ${moment(registration.subscriber.created).fromNow()}`);
        // embed.addField("Current status", registration.subscriber.status, true);
        // embed.addField("Consent for the hackathon", registration.subscriber.isconsented ? "consent given" : "consent not given", true);
      } else {
        embed.addField("➜ Website registration", "No registration found");
      }

      if (registration.participant) {
        embed.addField("➜ Junction registration", `Registered ${moment(registration.participant.created).fromNow()}`);
        // embed.addField("Current status", registration.participant.status, true);
      } else {
        embed.addField("➜ Junction registration", "No registration found");
      }

      if (registration.attendee) {
        embed.addField("➜ Eventtia registration", `Registered ${moment(registration.attendee.created).fromNow()}`);
        // embed.addField("Current status", registration.attendee.status, true);
      } else {
        embed.addField("➜ Eventtia registration", "No registration found");
      }

    } else {

      if (location) {
        embed.setDescription(`No registration was found for ${cassini.gethackathonname(location)}.`);
      } else {
        embed.setDescription(`No registration was found.`);
      }

    }

    embed.setTimestamp();

    return { embeds: [ embed ], flags: 1 << 6 };
  }

  async function registrationslist(interaction) {

    var location = await determinelocation(interaction);

    let user = await client.users.fetch(interaction.member.user.id);

    let registrationsmanager = new RegistrationsManager({ subscribergroup: cassini.getshortname() });

    let registrationsexport = new RegistrationsExport(registrationsmanager, process.env.DATA_FOLDER);

    let csv = await registrationsexport.exportascsv(location, [user.username, user.id, moment().toISOString()]);
    
    let directmessagecontent = "Here is the registrations list you have requested. Download the file and store it safely. Always handle these personal data according to the applicable data protection rules and agreements. This message and its attachment will be deleted after 2 minutes."
    let directmessage = new APIMessage(user, { content: directmessagecontent, files: [ registrationsexport.filepath(location, tags) ] });
    await directmessage.resolveData().resolveFiles();
    user.send(directmessage).then(message => { message.delete({ timeout: 120000 }); });

    let content = "I have sent you the registrations list in a direct message.";

    return { content, flags: 1 << 6 };
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
      {
        name: "check",
        description: "Check is a person is registered.",
        type: 1,
        options: [
          {
              name: "email",
              description: "The email address of the person",
              type: 3,
              required: true
          }
        ],
        run: registrationscheck
      },
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
