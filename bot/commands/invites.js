const invitemanager = require("../invitemanager");
const cassini = require("../../services/cassini");

function invites(interaction) {
  var location = interaction.data.options.find(option => option.name === "location").value;
  let invites = invitemanager.getinvitesforguild({ id: interaction.guild_id });
  let localinvites = invites.filter((invite) => invite.channel.parent.name === cassini.gethackathonname(location));
  let description = localinvites.map(formatinvite).join('\n');
  let title = `Invites for ${cassini.gethackathonname(location)}`
  let timestamp = new Date();
  return { type: 4, data: { embeds: [ { title, description, timestamp } ], flags: 1 << 6 } };
}

function groupinvitesbycategory(invites) {
  let groups = {}
  groups = invites.reduce((groups, invite) => {
    let category = invite.channel.parent;
    groups[category.name] = { category, invites: [] };
    return groups;
  }, groups);
  groups = invites.reduce((groups, invite) => {
    let category = invite.channel.parent;
    groups[category.name].invites.push(invite);
    return groups;
  }, groups);
  groups = Object.values(groups).sort((a, b) => a.category.position - b.category.position);
  groups = groups.map(group => { group.invites.sort((a, b) => a.channel.position - b.channel.position); return group });
  return groups;
}

function formatcategory(category) {
  return `**${category.name}**`;
}

function formatinvite(invite) {
  return `${invite.code} ➜ ${invite.channel} by ${invite.inviter} (${invite.uses} uses)`;
}

module.exports = {
  name: "invites",
  description: "List invites for a hackathon location.",
  options: [
    {
        name: "location",
        description: "The hackathon location of interest",
        type: 3,
        required: true,
        choices: cassini.getlocations().map((location) => ({ name: cassini.gethackathonname(location), value: location }))
    }
  ],
  run: invites,
  default_permission: false,
  allowedroles: [
    cassini.coreteammemberlabel()
  ]
};
