const dotenv = require("dotenv");

dotenv.config();
  
async function createmailerlitewebhooks(reset = false) {

  const mailerlite = require("../services/mailerlite");

  let events = [
    "subscriber.create",
    "subscriber.update",
    "subscriber.unsubscribe"
  ]
    
  let endpointurl = `https://${process.env.WEBSITE_HOSTNAME}/webhooks/mailerlite/`;

  if (reset) {

    let oldwebhooks = await mailerlite.getwebhooks();

    for (let webhook of oldwebhooks) {
      await mailerlite.deletewebhook(webhook.id).then(() => { console.log(`Webhook ${webhook.url} deleted for event ${webhook.event}`); });
    }
    
  }

  for (let event of events) {
    await mailerlite.createwebhook(event, endpointurl + event).then((webhook) => { console.log(`Webhook ${webhook.url} created for event ${webhook.event}`); });
  }

}

async function run() {
  await createmailerlitewebhooks(true);
}

module.exports = run();
