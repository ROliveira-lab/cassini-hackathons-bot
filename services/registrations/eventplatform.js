const eventtia = require("../eventtia");

async function getregistrations(location = undefined) {
  let attendees = await eventtia.getattendees();
  return location === undefined ? attendees : attendees.filter(r => r.location === location);
}

async function findregistration(email, location = undefined) {
  let attendee = await eventtia.getattendeebyemail(email);
  if (!attendee) { return undefined; }
  return location === undefined ? attendee : (attendee.location === location ? attendee : undefined);
}

async function createregistration(properties, registerforactivities = false) {
  let activities = registerforactivities ? await eventtia.getactivitiesforlocation(properties.location) : [];
  let attendee = await eventtia.registerattendee(properties, activities);
  return attendee;
}
