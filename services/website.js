const cassini = require("./cassini");
const mailerlite = require("./mailerlite");

// Website registrations

async function getregistrations(location = undefined) {
  // let group = await mailerlite.getgroupbyname(cassini.getshortname());
  // let subscribers = await mailerlite.getsubscribersingroup(group.id);
  let subscribers = await mailerlite.getsubscribers();
  let registrations = subscribers.map(transform);
  return location === undefined ? registrations : registrations.filter(r => r.location === location);
}

async function findregistration(email, location = undefined) {
  let subscriber = await mailerlite.getsubscriber(email);
  if (!subscriber) { return undefined; }
  let registration = transform(subscriber);
  return location === undefined ? registration : (registration.location === location ? registration : undefined);
}

function isactive(subscriber) {
  return subscriber.type === "active";
}

function isconsented(subscriber) {
  let consent = subscriber.fields.find((field) => field.key === "marketing_permissions")?.value;
  return consent && consent.includes("my participation in the hackathon");
}

function transform(subscriber) {
  let firstname = subscriber.fields.find((field) => field.key === "name")?.value;
  let lastname = subscriber.fields.find((field) => field.key === "last_name")?.value;
  let email = subscriber.fields.find((field) => field.key === "email")?.value;
  let location = subscriber.fields.find((field) => field.key === "hackathon_location")?.value;
  let datecreated =  subscriber.date_created;
  let dateupdated = subscriber.date_updated;
  return { datecreated, dateupdated, firstname, lastname, email, location, subscriber };
}

module.exports = {
  getregistrations,
  findregistration,
  isactive,
  isconsented,
  transform,
}