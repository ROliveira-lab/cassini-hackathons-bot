const { Router } = require("express");

const cassini = require("../services/cassini");
const { Attendee, AttendeeType } = require("../services/eventtia/model");
const mailerlite = require("../services/mailerlite");

module.exports = () => {

  const router = Router();
  
  router.post("/attendee_created", async (req, res) => {
    let attendee = new Attendee(req.body.data);
    attendee.attendeetype = new AttendeeType(req.body.included.find((o) => o.id === attendee.attendeetypeid));
    console.log(`Eventtia: Event attendee_created for ${attendee.email} received`);

    console.log(`Find registration for ${attendee.email} on the website.`);
    let subscriber = await mailerlite.getsubscriber(attendee.email);

    if (!subscriber) {
      console.log(`Create registration for ${attendee.email} on the website.`);

      let groupsofsubscriber = await mailerlite.getgroupsofsubscriber(attendee.email);
      let eventtiagroup = await mailerlite.getgroupbyname("Eventtia registrations");
      
      if (groupsofsubscriber) {
        for (let group of groupsofsubscriber) {
          if (group.id != eventtiagroup.id) {
            await mailerlite.removesubscriberfromgroup(group.id, attendee.email);
          }
        }
      }
      
      subscriber = await mailerlite.addnewsubscribertogroup(eventtiagroup.id, attendee);
    }

    res.status(200).json({ status: "OK" });
  });

  router.post("/attendee_updated", async (req, res) => {
    let attendee = new Attendee(req.body.data);
    attendee.attendeetype = req.body.included.find((o) => o.id === attendee.attendeetypeid);
    console.log(`Eventtia: Event attendee_updated for ${attendee.email} received`);
    res.status(200).json({ status: "OK" });
  });

  return router;

}