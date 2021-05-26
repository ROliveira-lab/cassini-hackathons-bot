const dotenv = require("dotenv");

dotenv.config();

const mailerlite = require("../services/mailerlite");
const eventtia = require("../services/eventtia");

async function registerattendeestoactivities(attendees, activities) {
  
  attendees = attendees ?? await eventtia.getattendees();
  activities = activities ?? await eventtia.getactivities();

  for (let attendee of attendees) {

    let currentactivities = await eventtia.getattendeeactivities(attendee.id);
    let localactivities = activities.filter((activity) => activity.canregister(attendee));

    currentactivityids = currentactivities.map((activity) => activity.id);
    localactivityids = localactivities.map((activity) => activity.id);

    let unregisterfor = currentactivities.filter((a) => !localactivityids.includes(a.id));
    for (let activity of unregisterfor) {
      console.log(`Unregister attendee ${attendee.id} for activity ${activity.id}`);
      await eventtia.unregisterattendeeforactivity(attendee, activity);
    }

    let registerfor = localactivities.filter((a) => !currentactivityids.includes(a.id));
    for (let activity of registerfor) {
      console.log(`Register attendee ${attendee.id} for activity ${activity.id}`);
      await eventtia.registerattendeeforactivity(attendee, activity);
    }

  }

}

async function addwebsitesubscriberstoeventplatform() {

  let subscribers = await mailerlite.getsubscribers();
  let currentattendees = await eventtia.getattendees();
  
  let newattendees = [];

  for (let subscriber of subscribers) {
    
    console.log(`Subscriber ${subscriber.email} found on the website.`);

    if (subscriber.isactive && subscriber.isconsented) {

      if (!currentattendees.find((attendee) => attendee.email === subscriber.email)) {
        console.log(`Create registration for ${subscriber.email} on the event platform.`);
        let attendee = await eventtia.registerattendee(subscriber);
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
  