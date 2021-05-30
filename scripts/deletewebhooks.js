const dotenv = require("dotenv");

dotenv.config();

async function deletemailerlitewebhooks() {

  const mailerlite = require("../services/mailerlite");

  let oldwebhooks = await mailerlite.getwebhooks();

  for (let webhook of oldwebhooks) {
      await mailerlite.deletewebhook(webhook.id).then(() => { console.log(`MailerLite: Webhook ${webhook.url} deleted for event ${webhook.event}`); });
  }
}

async function deleteeventtiawebhooks() {

  const eventtia = require("../services/eventtia");

  let events = [
    "attendee_created",
    "attendee_updated"
  ]
    
  let endpointurl = `https://${process.env.WEBSITE_HOSTNAME}/webhooks/eventtia/`;

  for (let event of events) {
    await eventtia.deletewebhook(endpointurl + event).then(() => { console.log(`Eventtia: Webhook ${endpointurl + event} deleted for event ${event}`); });
  }
}

async function run() {
  await deletemailerlitewebhooks();
  await deleteeventtiawebhooks();
}

module.exports = run();
