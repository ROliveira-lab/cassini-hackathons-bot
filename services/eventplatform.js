const cassini = require("./cassini");
const eventtia = require("./eventtia");
const { findbyid } = require("../helpers");

// Event platform registrations

async function getregistrations(location = undefined) {
  let attendees = await eventtia.getattendees();
  let attendeetypes = await eventtia.getattendeetypes();
  let registrations = attendees.map((attendee) => transform(attendee, attendeetypes));
  return location === undefined ? registrations : registrations.filter(r => r.location === location);
}

async function findregistration(email, location = undefined) {
  let attendee = await eventtia.getattendeebyemail(email);
  if (!attendee) { return undefined; }
  let attendeetypes = await eventtia.getattendeetypes();
  let registration = transform(attendee, attendeetypes);
  return location === undefined ? registration : (registration.location === location ? registration : undefined);
}

async function createregistration(registration, includeactivities = false) {
  let { firstname, lastname, email, location } = registration;
  let attendeetype = await eventtia.getattendeetypebylocation(location);
  let activities = includeactivities ? await eventtia.getactivitiesforattendeetype(attendeetype.id) : [];
  let attendee = await eventtia.registerattendee(attendeetype.id, { firstname, lastname, email }, activities.map(a => a.id));
  return transform(attendee, [attendeetype]);
}

function transform(attendee, attendeetypes) {
  let fields = Object.values(attendee.attributes.fields);
  let firstname = fields[0];
  let lastname = fields[1];
  let email = fields[2];
  let attendeetype = findbyid(attendeetypes, attendee.relationships.attendee_type.data.id);
  let location = cassini.gethackathonlocation(attendeetype.attributes.name);
  let datecreated = attendee.attributes.created_at;
  let dateupdated = attendee.attributes.updated_at;
  return { datecreated, dateupdated, firstname, lastname, email, location, attendee, attendeetype };
}

module.exports = {
  getregistrations,
  findregistration,
  createregistration,
  transform
}