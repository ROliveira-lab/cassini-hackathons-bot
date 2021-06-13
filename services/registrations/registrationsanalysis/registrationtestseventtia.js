const { RegistrationTest } = require("./registrationtest");

let sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

class EventtiaButNotOnWebsite extends RegistrationTest {

  async init() {
    this.eventtiagroup = await this.services.mailerlite.getgroupbyname("Eventtia registrations");
  }

  async test(registration) {
    if (registration.attendee && registration.attendee.isactive) {
      return registration.subscriber;
    }
    return true;
  }

  async fix(registration) {
    let subscribergroups = await this.services.mailerlite.getgroupsofsubscriber(registration.attendee.email);
    if (subscribergroups) {
      for (let group of subscribergroups) {
        await this.services.mailerlite.removesubscriberfromgroup(group.id, registration.attendee.email);
      }
      await sleep(10);
    }
    let subscriber = await this.services.mailerlite.addnewsubscribertogroup(this.eventtiagroup.id, registration.attendee);
    registration.subscriber = subscriber
    return subscriber
  }

}

class EventtiaOnWebsiteButUnconfirmed extends RegistrationTest {

  async init() {
    let group = await this.services.mailerlite.getgroupbyname(this.services.cassini.getshortname());
    let subscribers = await this.services.mailerlite.getsubscribersingroup(group.id, null);
    this.selectedsubscriberids = subscribers.map((subscriber) => subscriber.id);
  }

  async test(registration) {
    if (registration.attendee && registration.subscriber && this.selectedsubscriberids.includes(registration.subscriber.id)) {
      return !registration.subscriber.isunconfirmed;
    }
    return true;
  }

}


class EventtiaOnWebsiteButUnsubscribed extends RegistrationTest {

  async init() {
    let group = await this.services.mailerlite.getgroupbyname(this.services.cassini.getshortname());
    let subscribers = await this.services.mailerlite.getsubscribersingroup(group.id, null);
    this.selectedsubscriberids = subscribers.map((subscriber) => subscriber.id);
  }

  async test(registration) {
    if (registration.attendee && registration.subscriber && this.selectedsubscriberids.includes(registration.subscriber.id)) {
      return !registration.subscriber.isunsubscribed;
    }
    return true;
  }

}

class EventtiaOnWebsiteButNotConsented extends RegistrationTest {

  async init() {
    let group = await this.services.mailerlite.getgroupbyname(this.services.cassini.getshortname());
    let subscribers = await this.services.mailerlite.getsubscribersingroup(group.id, null);
    this.selectedsubscriberids = subscribers.map((subscriber) => subscriber.id);
  }

  async test(registration) {
    if (registration.attendee && registration.subscriber && this.selectedsubscriberids.includes(registration.subscriber.id)) {
      return registration.subscriber.isconsented;
    }
    return true;
  }

}

class EventtiaDifferentLocationAsOnWebsite extends RegistrationTest {

  async test(registration) {
    if (registration.attendee && registration.attendee.isactive && registration.subscriber) {
      return registration.attendee.location === registration.subscriber.location;
    }
    return true;
  }

  async fix(registration) {
    console.log(`Update ${registration.email} eventtia location from ${registration.attendee.location} to ${registration.subscriber.location}`);
    return false;
  }

}

class EventtiaNotRegisteredForEligibleActivities extends RegistrationTest {

  async init() {
    this.activities = await this.services.eventtia.getactivities();
  }

  async test(registration) {
    if (registration.attendee && registration.attendee.isactive) {
      let currentactivities = await this.services.eventtia.getattendeeactivities(registration.attendee.id);
      let eligibleactivities = this.activities.filter((activity) => activity.canregister(registration.attendee));
      let missingactivities = eligibleactivities.filter((ea) => !currentactivities.find((ca) => ca.id === ea.id));
      this.cache.missingactivities = missingactivities;
      return missingactivities.length === 0;
    }
    return true;
  }

  async fix(registration) {
    for (let activity of this.cache.missingactivities) {
      await this.services.eventtia.registerattendeeforactivity(registration.attendee, activity);
      await sleep(1);
    }
    return true;
  }

}

class EventtiaRegisteredForNonEligibleActivities extends RegistrationTest {

  async init() {
    this.activities = await this.services.eventtia.getactivities();
  }

  async test(registration) {
    if (registration.attendee && registration.attendee.isactive) {
      let currentactivities = await this.services.eventtia.getattendeeactivities(registration.attendee.id);
      let eligibleactivities = this.activities.filter((activity) => activity.canregister(registration.attendee));
      let redundantactivities = currentactivities.filter((ca) => !eligibleactivities.find((ea) => ea.id === ca.id));
      this.cache.redundantactivities = redundantactivities;
      return redundantactivities.length === 0;
    }
    return true;
  }

  async fix(registration) {
    for (let activity of this.cache.redundantactivities) {
      await this.services.eventtia.unregisterattendeeforactivity(registration.attendee, activity);
    }
  }

}

module.exports = {
  EventtiaButNotOnWebsite,
  EventtiaOnWebsiteButUnconfirmed,
  EventtiaOnWebsiteButUnsubscribed,
  EventtiaOnWebsiteButNotConsented,
  EventtiaDifferentLocationAsOnWebsite,
  EventtiaNotRegisteredForEligibleActivities,
  EventtiaRegisteredForNonEligibleActivities
}
