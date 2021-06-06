const axios = require("axios");
const puppeteer = require("puppeteer");
const moment = require("moment");

const { Event, Participant } = require("./model");

const junctionapi = axios.create({ baseURL: "https://app.hackjunction.com/api/" });

// Authentication

async function authenticate(attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    let browser = await puppeteer.launch();
    try {
      let page = await browser.newPage();
      await page.goto("https://app.hackjunction.com/login");
      await page.waitForNavigation();
      await page.waitForSelector(".auth0-lock-quiet");
      await page.screenshot({ path: 'screenshots/junction.png' });
      await page.type("input[type=email]", process.env.JUNCTION_EMAIL);
      await page.type("input[type=password]", process.env.JUNCTION_PASSWORD);
      await page.click("button[type=submit]");
      let callbackpage = await page.waitForNavigation();
      let callbackparams = Object.fromEntries(new URLSearchParams(new URL(callbackpage.frame().url()).hash.substring(1)));
      let token = callbackparams.id_token;
      let expires = moment().add(callbackparams.expires_in, 'seconds');
      return { token, expires };
    } catch (error) {
      console.error(`Junction authentication failed: ${error.message}`);
    } finally {
      await browser.close();
    }
  }
  console.error(`Junction authentication failed ${attempts} times`);
  return null;
}

var authpromise = authenticate();

async function ensureauthentication() {
  let authresult = await authpromise
  if (authresult && authresult.expires > moment()) {
    junctionapi.defaults.headers.common["Authorization"] = `Bearer ${authresult.token}`;
  } else {
    authpromise = authenticate();
    authresult = await authpromise;
    if (authresult && authresult.expires > moment()) {
      junctionapi.defaults.headers.common["Authorization"] = `Bearer ${authresult.token}`;
    } else {
      delete junctionapi.defaults.headers.common["Authorization"];
    }
  }
}

// Event

var defaultevent = process.env.JUNCTION_DEFAULTEVENT;

async function getevent(slug = defaultevent) {
  await ensureauthentication();
  let response = await junctionapi.get(`/events/${slug}`).catch((error) => console.error(error.message));
  return response ? new Event(response.data) : undefined;
}

// Participants

async function getparticipants(slug = defaultevent) {
  await ensureauthentication();
  let response = await junctionapi.get(`/registrations/${slug}/all`).catch((error) => console.error(error.message));
  return response ? response.data.map(item => new Participant(item)) : undefined;
}

module.exports = {
  getevent,
  getparticipants,
}
