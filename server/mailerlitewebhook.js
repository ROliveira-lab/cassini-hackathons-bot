const { Router } = require("express");

const eventtia = require("../services/eventtia");

const { Subscriber } = require("../services/mailerlite/model");

module.exports = () => {

  const router = Router();

  async function handlesubscribercreate(subscriber) {
    console.log(`${subscriber.firstname} ${subscriber.lastname} (${subscriber.email}) subscribed`);
  }

  async function handlesubscriberupdate(subscriber) {
    console.log(`${subscriber.firstname} ${subscriber.lastname} (${subscriber.email}) updated`);

    if (subscriber.isactive && subscriber.isconsented) {

      console.log(`Find registration for ${subscriber.email} on the event platform.`);
      let attendee = await eventtia.getattendeebyemail(subscriber.email);

      if (!attendee) {
        console.log(`Create registration for ${subscriber.email} on the event platform and register for all activities.`);
        let activities = await eventtia.getactivitiesforlocation(subscriber.location);
        attendee = await eventtia.registerattendee(subscriber, activities);
      }

    }

  }

  async function handlesubscriberunsubscribe(subscriber) {
    console.log(`${subscriber.firstname} ${subscriber.lastname} (${subscriber.email}) unsubscribed`);
  }

  const eventhandlers = {
    "subscriber.create": handlesubscribercreate,
    "subscriber.update": handlesubscriberupdate,
    "subscriber.unsubscribe": handlesubscriberunsubscribe
  }

  router.post("/events", async (req, res) => {
    for (let event of req.body.events) {
      console.log(`Event ${event.type} for subscriber ${event.data.subscriber.email} received.`);
      // eventhandlers[event.type](new Subscriber(event.data.subscriber));
    }
    res.status(200).json({ status: "OK" });
  });



  return router;

}