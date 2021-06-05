const axios = require("axios");
const puppeteer = require('puppeteer');

const { Event, Participant } = require("./model");


const junctionapi = axios.create({ baseURL: "https://app.hackjunction.com/api/" });

// Authentication

async function authenticate() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://app.hackjunction.com/login");
  await page.waitForNavigation();
  await page.waitForSelector(".auth0-lock-quiet");
  await page.type("input[type=email]", process.env.JUNCTION_EMAIL);
  await page.type("input[type=password]", process.env.JUNCTION_PASSWORD);
  await page.click("button[type=submit]");
  let callbackpage = await page.waitForNavigation();
  let callbackparams = Object.fromEntries(new URLSearchParams(new URL(callbackpage.frame().url()).hash.substring(1)));
  await browser.close();
  return callbackparams.id_token;
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
