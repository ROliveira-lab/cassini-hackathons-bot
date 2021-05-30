const invitemanager = require("../invitemanager");
const cassini = require("../../services/cassini");

function invites(interaction) {
  let invites = invitemanager.getinvitesforguild({ id: interaction.guild_id });
  let groups = groupinvitesbycategory(invites);
  let description = groups.map(group => [formatcategory(group.category), ...group.invites.map(formatinvite), ""]).flat().join('\n');
  let title = "All invites"
  let timestamp = new Date();
  return { type: 4, data: { embeds: [ { title, description, timestamp } ], flags: 1 << 6 } };
}

function groupinvitesbycategory(invites) {
  let groups = []
  groups = invites.reduce((groups, invite) => {
    let category = invite.channel.parent;
    groups[category.position] = { category, invites: [] };
    return groups;
  }, groups);
  groups = invites.reduce((groups, invite) => {
    let category = invite.channel.parent;
    groups[category.position].invites.push(invite);
    return groups;
  }, groups);
  groups = groups.filter(group => group != undefined);
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
  description: "List all invites.",
  run: invites,
  default_permission: false,
  allowedroles: [
    cassini.coreteammemberlabel()
  ]
};
