const axios = require("axios");
const puppeteer = require("puppeteer");
const moment = require("moment");

const { Event, Participant } = require("./model");

const junctionapi = axios.create({ baseURL: "https://app.hackjunction.com/api/" });

// Authentication

async function authenticate(attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    let browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage"
      ],
      headless: true,
    });
    try {
      let start = moment();
      let page = await browser.newPage();
      await page.goto("https://app.hackjunction.com/login");
      await page.waitForSelector(".auth0-lock-input-block.auth0-lock-input-email input.auth0-lock-input[type=email]", { visible: true }).then((emailinput) => emailinput.type(process.env.JUNCTION_EMAIL));
      await page.waitForSelector(".auth0-lock-input-block.auth0-lock-input-password input.auth0-lock-input[type=password]", { visible: true }).then((passwordinput) => passwordinput.type(process.env.JUNCTION_PASSWORD));
      let waitforcallback = page.waitForResponse((response) => response.url().startsWith("https://hackjunction.eu.auth0.com/login/callback"));
      await page.waitForSelector("button.auth0-lock-submit[type=submit]", { visible: true }).then((loginbutton) => loginbutton.click());
      let callback = await waitforcallback;
      let params = Object.fromEntries(new URLSearchParams(new URL(callback.headers().location).hash.substring(1)));
      let end = moment();
      console.error(`Junction authentication succeeded in ${end - start}ms`);
      return { token: params.id_token, expires: moment().add(params.expires_in, 'seconds') };
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

async function getparticipantbyid(participantid, slug = defaultevent) {
  let participants = await getparticipants(slug);
  return participants.find((participant) => participant.id === participantid);
}

async function getparticipantbyemail(participantemail, slug = defaultevent) {
  let participants = await getparticipants(slug);
  return participants.find((participant) => participant.email === participantemail);
}

module.exports = {
  getevent,
  getparticipants,
  getparticipantbyid,
  getparticipantbyemail
}
