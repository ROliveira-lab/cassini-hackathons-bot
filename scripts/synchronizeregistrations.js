const dotenv = require("dotenv");

dotenv.config();

const mailerlite = require("../services/mailerlite");
const eventtia = require("../services/eventtia");

let sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

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
    
    if (subscriber.isactive && subscriber.isconsented) {

      if (!currentattendees.find((attendee) => attendee.email === subscriber.email)) {
        console.log(`Register ${subscriber.email} on the event platform.`);
        let attendee = await eventtia.registerattendee(subscriber);
        if (attendee) { newattendees.push(attendee); }    
        await sleep(5);
      }

    }

  }

  return newattendees;

}

async function addeventplatformattendeestowebsite() {

  let eventtiagroup = await mailerlite.getgroupbyname("Eventtia registrations");
  
  let attendees = await eventtia.getattendees();
  let currentsubscribers = await mailerlite.getsubscribers(null);
  
  let newsubscribers = [];

  for (let attendee of attendees) {
    
    if (attendee.isactive) {

      if (!currentsubscribers.find((subscriber) => subscriber.email === attendee.email)) {
        console.log(`Register ${attendee.email} on the website.`);

        let groupsofsubscriber = await mailerlite.getgroupsofsubscriber(attendee.email);
        if (groupsofsubscriber) {
          for (let group of groupsofsubscriber) {
            await mailerlite.removesubscriberfromgroup(group.id, attendee.email);
          }
          await sleep(10);
        }
        subscriber = await mailerlite.addnewsubscribertogroup(eventtiagroup.id, attendee); 
      }

    }

  }

  return newsubscribers;

}

async function run() {
  let newattendees = await addwebsitesubscriberstoeventplatform();
  await registerattendeestoactivities(newattendees);
  await addeventplatformattendeestowebsite()
}
  
module.exports = run();
  