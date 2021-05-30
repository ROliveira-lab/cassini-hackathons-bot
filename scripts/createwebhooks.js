const dotenv = require("dotenv");

dotenv.config();
  
async function createeventtiawebhooks() {

  const eventtia = require("../services/eventtia");

  let events = [
    "attendee_created",
    "attendee_updated"
  ]
    
  let endpointurl = `https://${process.env.WEBSITE_HOSTNAME}/webhooks/eventtia/`;

  for (let event of events) {
    await eventtia.createwebhook(event, endpointurl + event).then((webhook) => { console.log(webhook); });
  }

}

async function createmailerlitewebhooks(reset = false) {

  const mailerlite = require("../services/mailerlite");

  let events = [
    "subscriber.create",
    "subscriber.update",
    "subscriber.unsubscribe"
  ]
    
  let endpointurl = `https://${process.env.WEBSITE_HOSTNAME}/webhooks/mailerlite/`;

  for (let event of events) {
    await mailerlite.createwebhook(event, endpointurl + event).then((webhook) => { console.log(`MailerLite: Webhook ${webhook.url} created for event ${webhook.event}`); });
  }
}

async function run() {
  // await createmailerlitewebhooks();
  await createeventtiawebhooks();
}

module.exports = run();
