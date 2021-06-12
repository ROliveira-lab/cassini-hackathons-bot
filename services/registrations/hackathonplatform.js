const junction = require("../junction");

async function getregistrations(location = undefined) {
  let participants = await junction.getparticipants();
  return location === undefined ? participants : participants.filter(r => r.location === location);
}

async function findregistration(email, location = undefined) {
  let participant = await junction.getparticipantbyemail(email);
  if (!participant) { return undefined; }
  return location === undefined ? participant : (participant.location === location ? participant : undefined);
}
