const { Router } = require("express");

const website = require("../services/website");
const eventplatform = require("../services/eventplatform");

module.exports = () => {

  const router = Router();

  async function handlesubscribercreate(subscriber) {
    let registration = website.transform(subscriber);
    console.log(`${registration.firstname} ${registration.lastname} (${registration.email}) subscribed`);
  }

  async function handlesubscriberupdate(subscriber) {

    if (website.isactive(subscriber) && website.isconsented(subscriber)) {

      console.log(`Find registration for ${subscriber.email} on the event platform.`);
      let registration = await eventplatform.findregistration(subscriber.email);

      if (!registration) {
        console.log(`Create registration for ${subscriber.email} on the event platform.`);
        await eventplatform.createregistration(website.transform(subscriber), true);
      }
    }

}

  async function handlesubscriberunsubscribe(subscriber) {
    let registration = website.transform(subscriber);
    console.log(`${registration.firstname} ${registration.lastname} (${registration.email}) unsubscribed`);
  }

  const eventhandlers = {
    "subscriber.create": handlesubscribercreate,
    "subscriber.update": handlesubscriberupdate,
    "subscriber.unsubscribe": handlesubscriberunsubscribe
  }

  router.post("/events", async (req, res) => {
    for (let event of req.body.events) {
      console.log(`Event ${event.type} for subscriber ${event.data.subscriber.email} received.`);
      eventhandlers[event.type](event.data.subscriber)
    }
    res.status(200).json({ status: "OK" });
  });



  return router;

}