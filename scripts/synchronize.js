const dotenv = require("dotenv");

dotenv.config();

const mailerlite = require("../services/mailerlite");
const eventtia = require("../services/eventtia");
const website = require("../services/website");
const eventplatform = require("../services/eventplatform");

async function registerattendeestoactivities(attendees, activities) {
  
  attendees = attendees ?? await eventtia.getattendees();
  activities = activities ?? await eventtia.getactivities();

  for (let attendee of attendees) {

    let currentactivities = await eventtia.getattendeeactivities(attendee.id);
    let localactivities = activities.filter((activity) => activity.attributes.show_on_register && (attendee.relationships.attendee_type.data.id in activity.attributes.price));

    currentactivityids = currentactivities.map((activity) => activity.id);
    localactivityids = localactivities.map((activity) => activity.id);

    let unregisterids = currentactivityids.filter((id) => !localactivityids.includes(id));
    for (let activityid of unregisterids) {
      console.log(`Unregister attendee ${attendee.id} for activity ${activityid}`);
      await eventtia.unregisterattendeeforactivity(attendee.id, activityid);
    }

    let registerids = localactivityids.filter((id) => !currentactivityids.includes(id));
    for (let activityid of registerids) {
      console.log(`Register attendee ${attendee.id} for activity ${activityid}`);
      await eventtia.registerattendeeforactivity(attendee.id, activityid);
    }

  }

}

async function addwebsitesubscriberstoeventplatform() {

  let subscribers = await mailerlite.getsubscribers();
  let currentattendees = await eventtia.getattendees();
  let currentattendeeemails = currentattendees.map(a => Object.values(a.attributes.fields)[2]);
  
  let newattendees = [];

  for (let subscriber of subscribers) {
    
    console.log(`Subscriber ${subscriber.email} found on the website.`);

    if (website.isactive(subscriber) && website.isconsented(subscriber)) {

      if (!currentattendeeemails.includes(subscriber.email)) {
        console.log(`Create registration for ${subscriber.email} on the event platform.`);
        let attendee = await eventplatform.createregistration(website.transform(subscriber));
        newattendees.push(attendee);
      }

    }

  }

  registerattendeestoactivities(newattendees);

}

async function run() {
  await registerattendeestoactivities();
  // await addwebsitesubscriberstoeventplatform();
}
  
module.exports = run();
  