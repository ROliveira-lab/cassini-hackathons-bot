const cassini = require("../cassini");
const mailerlite = require("../mailerlite");

// Website registrations

async function getregistrations(location = undefined) {
  let group = await mailerlite.getgroupbyname(cassini.getshortname());
  let subscribers = await mailerlite.getsubscribersingroup(group.id, null);
  subscribers = subscribers.filter((subscriber) => subscriber.status != "unsubscribed");
  return location === undefined ? subscribers : subscribers.filter(r => r.location === location);
}

async function findregistration(email, location = undefined) {
  let group = await mailerlite.getgroupbyname(cassini.getshortname());
  let subscriber = await mailerlite.getsubscriber(email);
  let subscribergroups = await mailerlite.getgroupsofsubscriber(email);
  subscriber = subscribergroups.find((subscribergroup) => subscribergroup.name === group.name) ? subscriber : undefined
  if (!subscriber) { return undefined; }
  return location === undefined ? subscriber : (subscriber.location === location ? subscriber : undefined);
}

module.exports = {
  getregistrations,
  findregistration
}
