const axios = require("axios");

const { Subscriber } = require("./model");


const mailerliteapi = axios.create({ baseURL: "https://api.mailerlite.com/api/v2/", headers: { "X-MailerLite-ApiKey": process.env.MAILERLITE_API_KEY } });

// Groups

async function getgroups() {
  let response = await mailerliteapi.get(`/groups`, { params: { offset: 0, limit: 100 } });
  return response?.data;
}

async function getgroupbyid(groupid) {
  let response = await mailerliteapi.get(`/groups/${groupid}`);
  return response?.data;
}

async function getgroupbyname(groupname) {
  let response = await mailerliteapi.get(`/groups`);
  return response?.data.find((group) => group.name === groupname);
}

async function getgroupsofsubscriber(subscriberidoremail) {
  let response = await mailerliteapi.get(`/subscribers/${subscriberidoremail}/groups`).catch((error) => console.error(error.message, error.response.data));
  return response?.data;
}

// Subscribers

async function getsubscribers(type = "active") {
  let response = await mailerliteapi.get(`/subscribers`, { params: { offset: 0, limit: 5000, type } });
  return response ? response.data.map(item => new Subscriber(item)) : undefined;
}

async function getsubscribersingroup(groupid, type = "active") {
  let response = await mailerliteapi.get(`/groups/${groupid}/subscribers`, { params: { offset: 0, limit: 5000, type } });
  return response ? response.data.map(item => new Subscriber(item)) : undefined;
}

async function getsubscriber(subscriberidoremail) {
  let response = await mailerliteapi.get(`/subscribers/${subscriberidoremail}`).catch((error) => console.error(error.message, error.response.data));
  return response ? new Subscriber(response.data) : undefined;
}

async function getsubscriberingroup(groupid, subscriberid) {
  let response = await mailerliteapi.get(`/groups/${groupid}/subscribers/${subscriberid}`).catch((error) => console.error(error.message, error.response.data));
  return response ? new Subscriber(response.data) : undefined;
}

function subscriberprototype(registration) {
  let subscriber = {
    email: registration.email,
    name: registration.firstname,
    fields: {
      email: registration.email,
      name: registration.firstname,
      last_name: registration.lastname,
      hackathon_location: registration.location,
      terms_conditions: null,
      discord_url: null,
      marketing_permissions: null,
    }
  }
  return subscriber;
}

async function updatesubscriber(subscriberidoremail, registration) {
  let subscriber = subscriberprototype(registration);
  let response = await mailerliteapi.put(`/subscribers/${subscriberidoremail}`, subscriber).catch((error) => console.error(error.message, error.response.data));
  return response ? new Subscriber(response.data) : undefined;
}

async function addnewsubscriber(registration) {
  let subscriber = subscriberprototype(registration);
  let response = await mailerliteapi.post(`/subscribers`, subscriber).catch((error) => console.error(error.message, error.response.data));;
  return response ? new Subscriber(response.data) : undefined;
}

async function addnewsubscribertogroup(groupid, registration) {
  let subscriber = subscriberprototype(registration);
  let response = await mailerliteapi.post(`/groups/${groupid}/subscribers`, subscriber).catch((error) => console.error(error.message, error.response.data));;
  return response ? new Subscriber(response.data) : undefined;
}

async function removesubscriberfromgroup(groupid, subscriberidoremail) {
  await mailerliteapi.delete(`/groups/${groupid}/subscribers/${subscriberidoremail}`).catch((error) => console.error(error.message, error.response.data));
}

// Webhooks

async function getwebhooks() {
  let response = await mailerliteapi.get(`/webhooks`, { params: { } });
  return response?.data.webhooks;
}

async function createwebhook(event, url) {
  let response = await mailerliteapi.post(`/webhooks`, { event, url })
  return response?.data;
}

async function deletewebhook(id) {
  let response = await mailerliteapi.delete(`/webhooks/${id}`);
  return response?.data;
}

module.exports = {
  getgroups,
  getgroupbyid,
  getgroupbyname,
  getgroupsofsubscriber,
  getsubscribers,
  getsubscribersingroup,
  getsubscriber,
  getsubscriberingroup,
  updatesubscriber,
  addnewsubscriber,
  addnewsubscribertogroup,
  removesubscriberfromgroup,
  getwebhooks,
  createwebhook,
  deletewebhook
}