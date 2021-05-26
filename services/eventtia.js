const axios = require("axios");

const cassini = require("./cassini");

const eventtiaapi = axios.create({ baseURL: "https://connect.eventtia.com/api/v3/" });

// Authentication

async function authenticate(email, password) {
  email = email ?? process.env.EVENTTIA_EMAIL;
  password = password ?? process.env.EVENTTIA_PASSWORD;
  let response = await eventtiaapi.post("/auth", { email, password });
  return response?.data.auth_token
}

const authentication = authenticate().then((token) => { eventtiaapi.defaults.headers.common["Authorization"] = `Bearer ${token}`; });

var defaultevent = process.env.EVENTTIA_DEFAULTEVENT;

var cache = {}

async function getevent(slug = defaultevent) {
  await authentication;
  if (cache.event) { return cache.event; }
  let response = await eventtiaapi.get(`/events/${slug}`);
  cache.event = response?.data.data;
  return response?.data.data;
}

async function getattendeetypes(slug = defaultevent) {
  await authentication;
  if (cache.attendeetypes) { return cache.attendeetypes; }
  let result = []
  let uri = `/events/${slug}/attendee_types`;
  while (uri) {
    let response = await eventtiaapi.get(uri);
    result = result.concat(response ? response.data.data : []);
    uri = response ? response.data.links.next : undefined;
  }
  cache.attendeetypes = result;
  return result;
}

async function getattendeetypebyid(attendeetypeid, slug = defaultevent) {
  let attendeetypes = await getattendeetypes(slug);
  return attendeetypes.find((attendeetype) => attendeetype.id === attendeetypeid);
}

async function getattendeetypebylocation(location, slug = defaultevent) {
  let attendeetypes = await getattendeetypes(slug);
  return attendeetypes.find((attendeetype) => cassini.gethackathonlocation(attendeetype.attributes.name) === location)
}

async function getattendees(slug = defaultevent) {
  await authentication;
  let result = []
  let uri = `/events/${slug}/attendees`;
  while (uri) {
    let response = await eventtiaapi.get(uri);
    result = result.concat(response ? response.data.data : []);
    uri = response ? response.data.links.next : undefined;
  }
  return result;
}

async function getattendeebyid(attendeeid, slug = defaultevent) {
  await authentication;
  let response = await eventtiaapi.get(`/events/${slug}/attendees/${attendeeid}`);
  return response?.data?.data;
}

async function getattendeebyemail(attendeeemail, slug = defaultevent) {
  await authentication;
  let response = await eventtiaapi.get(`/events/${slug}/attendees/by_email`, { params: { email: attendeeemail } });
  return response?.data?.data;
}

async function getattendeeactivities(attendeeid, slug = defaultevent) {
  await authentication;
  let result = []
  let uri = `/events/${slug}/attendees/${attendeeid}/workshops`;
  while (uri) {
    let response = await eventtiaapi.get(uri);
    result = result.concat(response ? response.data.data : []);
    uri = response ? response.data.links.next : undefined;
  }
  return result;
}

async function getactivities(slug = defaultevent) {
  await authentication;
  let result = []
  let uri = `/events/${slug}/workshops`;
  while (uri) {
    let response = await eventtiaapi.get(uri);
    result = result.concat(response ? response.data.data : []);
    uri = response ? response.data.links.next : undefined;
  }
  return result;
}

async function getactivitiesforattendeetype(attendeetypeid, slug = defaultevent) {
  let activities = await getactivities(slug);
  return activities.filter((activity) => activity.attributes.show_on_register && (attendeetypeid in activity.attributes.price));
}

async function getactivitiesforlocation(location, slug = defaultevent) {
  let attendeetype = await getattendeetypebylocation(location, slug);
  let activities = await getactivitiesforattendeetype(attendeetype.id, slug);
  return activities;
}

async function registerattendee(attendeetypeid, properties, activityids = [], slug = defaultevent) {
  let api_key = process.env.EVENTTIA_API_KEY;
  let event = await getevent(slug);
  let event_id = event.id;
  let attendee_type_id = attendeetypeid;
  let first_name = properties.firstname;
  let last_name = properties.lastname;
  let email = properties.email;
  let attendee = { attendee_type_id, first_name, last_name, email };
  let workshops = activityids.reduce((result, id) => ({ ...result, [id]: id }),{})
  let response = await eventtiaapi.post(`/events/${slug}/attendees/register`, { api_key, event_id, attendee, workshops });
  return response?.data.data;
}

async function registerattendeeforactivity(attendeeid, activityid, slug = defaultevent) {
  let attendee_id = attendeeid;
  let workshop_id = activityid;
  let response = await eventtiaapi.post(`/events/${slug}/attendee_workshops`, { attendee_id, workshop_id });
  return response?.data.data;
}

async function unregisterattendeeforactivity(attendeeid, activityid, slug = defaultevent) {
  let attendee_id = attendeeid;
  let workshop_id = activityid;
  let response = await eventtiaapi.delete(`/events/${slug}/attendee_workshops`, { data: { attendee_id, workshop_id } });
  return response?.data.data;
}

async function updateactivitiesofattendee(attendeeid, activityids, slug = defaultevent) {
  let workshop_ids = activityids.join(',');
  let response = await eventtiaapi.post(`/events/${slug}/attendees/${attendeeid}/update_activities`, { workshop_ids });
  return response?.data.data;
}

module.exports = {
  getevent,
  getattendeetypes,
  getattendeetypebyid,
  getattendeetypebylocation,
  getattendees,
  getattendeebyid,
  getattendeebyemail,
  getattendeeactivities,
  getactivities,
  getactivitiesforattendeetype,
  getactivitiesforlocation,
  getattendeebyid,
  getattendeebyemail,
  registerattendee,
  registerattendeeforactivity,
  unregisterattendeeforactivity,
  updateactivitiesofattendee
}