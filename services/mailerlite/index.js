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
  let response = await mailerliteapi.get(`/subscribers/${subscriberidoremail}`);
  return response ? new Subscriber(response.data) : undefined;
}

async function updatesubscriber(subscriberidoremail, subscriber) {
  let response = await mailerliteapi.put(`/subscribers/${subscriberidoremail}`, subscriber);
  return response ? new Subscriber(response.data) : undefined;
}

async function createsubscriber(subscriber) {
  let response = await mailerliteapi.post(`/subscribers`, subscriber);
  return response ? new Subscriber(response.data) : undefined;
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
  getsubscribers,
  getsubscribersingroup,
  getsubscriber,
  updatesubscriber,
  createsubscriber,
  getwebhooks,
  createwebhook,
  deletewebhook
}