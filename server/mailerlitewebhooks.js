const { Router } = require("express");

const { Subscriber } = require("../services/mailerlite/model");
const eventtia = require("../services/eventtia");

module.exports = () => {

  const router = Router();

  function logevent(event) {
    console.log(`MailerLite: Event ${event.type} for ${event.data.subscriber.firstname} ${event.data.subscriber.lastname} (${event.data.subscriber.email}) received`);
  }

  router.post("/subscriber.create", async (req, res) => {
    for (let event of req.body.events) {
      logevent(event);
    }
    res.status(200).json({ status: "OK" });
  });

  router.post("/subscriber.update", async (req, res) => {
    for (let event of req.body.events) {
      logevent(event);

      let subscriber = new Subscriber(event.data.subscriber);
      
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
    res.status(200).json({ status: "OK" });
  });

  router.post("/subscriber.unsubscribe", async (req, res) => {
    for (let event of req.body.events) {
      logevent(event);
    }
    res.status(200).json({ status: "OK" });
  });

  return router;

}