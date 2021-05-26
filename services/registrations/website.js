const cassini = require("../cassini");
const mailerlite = require("../mailerlite");

// Website registrations

async function getregistrations(location = undefined) {
  let group = await mailerlite.getgroupbyname(cassini.getshortname());
  let subscribers = await mailerlite.getsubscribersingroup(group.id);
  return location === undefined ? subscribers : subscribers.filter(r => r.location === location);
}

async function findregistration(email, location = undefined) {
  let subscriber = await mailerlite.getsubscriber(email);
  if (!subscriber) { return undefined; }
  return location === undefined ? subscriber : (subscriber.location === location ? subscriber : undefined);
}

module.exports = {
  getregistrations,
  findregistration
}
