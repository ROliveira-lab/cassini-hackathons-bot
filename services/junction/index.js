const axios = require("axios");

const { Event, Participant } = require("./model");


const junctionapi = axios.create({ baseURL: "https://app.hackjunction.com/api/" });

// Authentication

async function authenticate(token) {
  return token ?? process.env.JUNCTION_TOKEN;
}
  
const authentication = authenticate().then((token) => { junctionapi.defaults.headers.common["Authorization"] = `Bearer ${token}`; });

// Event

var defaultevent = process.env.JUNCTION_DEFAULTEVENT;

async function getevent(slug = defaultevent) {
  await authentication;
  let response = await junctionapi.get(`/events/${slug}`);
  return response ? new Event(response.data) : undefined;
}

// Participants

async function getparticipants(slug = defaultevent) {
  await authentication;
  let response = await junctionapi.get(`/registrations/${slug}/all`);
  return response ? response.data.map(item => new Participant(item)) : undefined;
}

module.exports = {
  getevent,
  getparticipants,
}
