const axios = require("axios");

const cassini = require("../cassini");

const { Event, AttendeeType, Attendee, Activity } = require("./model");

// API endpoint

const eventtiaapi = axios.create({ baseURL: "https://connect.eventtia.com/api/v3/" });

eventtiaapi.getdata = async function(url, config = {}) {
  let response = await eventtiaapi.get(url, config);
  return response?.data?.data;
}

eventtiaapi.getdatawithpagination = async function (url, config = {}) {
  let data = []
  while (url) {
    let response = await eventtiaapi.get(url, config);
    data = data.concat(response ? response.data.data : []);
    url = response ? response.data.links.next : undefined;
  }
  return data;
}

var cache = {}

function cachingdecorator(getdata) {
  return async function(...args) {
    let key = JSON.stringify(args);
    if (key in cache) { return cache[key]; }
    else { cache[key] = await getdata(...args); return cache[key]; }
  }
}

eventtiaapi.getdatacached = cachingdecorator(eventtiaapi.getdata);

eventtiaapi.getdatawithpaginationcached  = cachingdecorator(eventtiaapi.getdatawithpagination);

// Authentication

async function authenticate(email, password) {
  email = email ?? process.env.EVENTTIA_EMAIL;
  password = password ?? process.env.EVENTTIA_PASSWORD;
  let response = await eventtiaapi.post("/auth", { email, password });
  return response?.data.auth_token
}

const authentication = authenticate().then((token) => { eventtiaapi.defaults.headers.common["Authorization"] = `Bearer ${token}`; });

// Event

var defaultevent = process.env.EVENTTIA_DEFAULTEVENT;

async function getevent(slug = defaultevent) {
  await authentication;
  let data = await eventtiaapi.getdatacached(`/events/${slug}`);
  let event = data ? new Event(data) : undefined;
  return event;
}

// Attendeetype

async function getattendeetypes(slug = defaultevent) {
  await authentication;
  let data = await eventtiaapi.getdatawithpaginationcached(`/events/${slug}/attendee_types`);
  let attendeetypes = data.map(item => new AttendeeType(item));
  return attendeetypes;
}

async function getattendeetypebyid(attendeetypeid, slug = defaultevent) {
  let attendeetypes = await getattendeetypes(slug);
  return attendeetypes.find((attendeetype) => attendeetype.id === attendeetypeid);
}

async function getattendeetypebylocation(location, slug = defaultevent) {
  let attendeetypes = await getattendeetypes(slug);
  return attendeetypes.find((attendeetype) => attendeetype.location === location);
}

// Attendee

async function getattendees(slug = defaultevent) {
  await authentication;
  let data = await eventtiaapi.getdatawithpagination(`/events/${slug}/attendees`);
  let attendees = data.map(item => new Attendee(item));
  await Promise.all(attendees.map(async (attendee) => { attendee.attendeetype = await getattendeetypebyid(attendee.attendeetypeid); return attendee; }));
  return attendees;
}

async function getattendeebyid(attendeeid, slug = defaultevent) {
  await authentication;
  let data = await eventtiaapi.getdata(`/events/${slug}/attendees/${attendeeid}`);
  if (!data) { return undefined; }
  let atttendee = new Attendee(data);
  attendee.attendeetype = await getattendeetypebyid(attendee.attendeetypeid);
  return atttendee;
}

async function getattendeebyemail(attendeeemail, slug = defaultevent) {
  await authentication;
  let data = await eventtiaapi.getdata(`/events/${slug}/attendees/by_email`, { params: { email: attendeeemail } });
  if (!data) { return undefined; }
  let attendee = new Attendee(data);
  attendee.attendeetype = await getattendeetypebyid(attendee.attendeetypeid);
  return attendee;
}

// Activities

async function getactivities(slug = defaultevent) {
  await authentication;
  let data = await eventtiaapi.getdatawithpagination(`/events/${slug}/workshops`);
  let activities = data.map(item => new Activity(item));
  return activities;
}

async function getattendeeactivities(attendeeid, slug = defaultevent) {
  await authentication;
  let data = await eventtiaapi.getdatawithpagination(`/events/${slug}/attendees/${attendeeid}/workshops`);
  let activities = data.map(item => new Activity(item));
  return activities;
}

async function getactivitiesforattendeetype(attendeetypeid, slug = defaultevent) {
  let activities = await getactivities(slug);
  return activities.filter((activity) => activity.canregister(attendeetypeid));
}

async function getactivitiesforlocation(location, slug = defaultevent) {
  let attendeetype = await getattendeetypebylocation(location, slug);
  let activities = await getactivitiesforattendeetype(attendeetype.id, slug);
  return activities;
}

// Actions

async function registerattendee(properties, activities = [], slug = defaultevent) {
  await authentication;
  let attendeetype = await getattendeetypebylocation(properties.location);
  let event = await getevent(slug);
  let api_key = event.apikey;
  let event_id = event.id;
  let attendee = {
    attendee_type_id: attendeetype.id,
    first_name: properties.firstname,
    last_name: properties.lastname,
    email: properties.email
  };
  let workshops = activities.map(a => a.id).reduce((result, id) => ({ ...result, [id]: id }),{});
  let response = await eventtiaapi.post(`/events/${slug}/attendees/register`, { api_key, event_id, attendee, workshops }).catch((error) => console.error(error.message));
  return response ? new Attendee(response.data.data) : undefined;
}

async function registerattendeeforactivity(attendee, activity, slug = defaultevent) {
  await authentication;
  let attendee_id = attendee.id;
  let workshop_id = activity.id;
  let response = await eventtiaapi.post(`/events/${slug}/attendee_workshops`, { attendee_id, workshop_id }).catch((error) => console.error(error.message));
  return response?.data.data;
}

async function unregisterattendeeforactivity(attendee, activity, slug = defaultevent) {
  await authentication;
  let attendee_id = attendee.id;
  let workshop_id = activity.id;
  let response = await eventtiaapi.delete(`/events/${slug}/attendee_workshops`, { data: { attendee_id, workshop_id } }).catch((error) => console.error(error.message));
  return response?.data.data;
}

async function updateactivitiesofattendee(attendee, activities, slug = defaultevent) {
  await authentication;
  let workshop_ids = activities.map(a => a.id).join(',');
  let response = await eventtiaapi.post(`/events/${slug}/attendees/${attendee.id}/update_activities`, { workshop_ids }).catch((error) => console.error(error.message));
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
